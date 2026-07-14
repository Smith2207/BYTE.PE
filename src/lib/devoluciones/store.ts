import { and, desc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { solicitudesDevolucion, pedidos, pedidoItems } from "@/db/schema";
import type { EstadoDevolucion, TipoDevolucion } from "@/db/schema/enums";
import { restaurarStock } from "@/lib/mock/repo";

export type SolicitudDevolucionAlmacenada = {
  id: string;
  pedidoId: string;
  pedidoNumero: string;
  pedidoTotal: number;
  usuarioId: string | null;
  tipo: TipoDevolucion;
  motivo: string;
  estado: EstadoDevolucion;
  notaAdmin: string | null;
  montoReembolsado: number | null;
  createdAt: string;
  resueltoEn: string | null;
};

function aSolicitudAlmacenada(
  s: typeof solicitudesDevolucion.$inferSelect,
  pedidoNumero: string,
  pedidoTotal: string,
): SolicitudDevolucionAlmacenada {
  return {
    id: s.id,
    pedidoId: s.pedidoId,
    pedidoNumero,
    pedidoTotal: Number(pedidoTotal),
    usuarioId: s.usuarioId,
    tipo: s.tipo,
    motivo: s.motivo,
    estado: s.estado,
    notaAdmin: s.notaAdmin,
    montoReembolsado: s.montoReembolsado != null ? Number(s.montoReembolsado) : null,
    createdAt: s.createdAt.toISOString(),
    resueltoEn: s.resueltoEn ? s.resueltoEn.toISOString() : null,
  };
}

export async function crearSolicitudDevolucion(input: {
  pedidoId: string;
  usuarioId: string | null;
  tipo: TipoDevolucion;
  motivo: string;
}) {
  const [fila] = await db.insert(solicitudesDevolucion).values(input).returning();
  const solicitud = await obtenerSolicitud(fila.id);
  if (!solicitud) throw new Error("No se pudo crear la solicitud");
  return solicitud;
}

export async function listarSolicitudesDevolucion(): Promise<SolicitudDevolucionAlmacenada[]> {
  const filas = await db
    .select({
      solicitud: solicitudesDevolucion,
      pedidoNumero: pedidos.numeroPedido,
      pedidoTotal: pedidos.total,
    })
    .from(solicitudesDevolucion)
    .innerJoin(pedidos, eq(solicitudesDevolucion.pedidoId, pedidos.id))
    .orderBy(desc(solicitudesDevolucion.createdAt));
  return filas.map((f) => aSolicitudAlmacenada(f.solicitud, f.pedidoNumero, f.pedidoTotal));
}

export async function listarSolicitudesPorUsuario(
  usuarioId: string,
): Promise<SolicitudDevolucionAlmacenada[]> {
  const filas = await db
    .select({
      solicitud: solicitudesDevolucion,
      pedidoNumero: pedidos.numeroPedido,
      pedidoTotal: pedidos.total,
    })
    .from(solicitudesDevolucion)
    .innerJoin(pedidos, eq(solicitudesDevolucion.pedidoId, pedidos.id))
    .where(eq(solicitudesDevolucion.usuarioId, usuarioId))
    .orderBy(desc(solicitudesDevolucion.createdAt));
  return filas.map((f) => aSolicitudAlmacenada(f.solicitud, f.pedidoNumero, f.pedidoTotal));
}

export async function obtenerSolicitud(id: string): Promise<SolicitudDevolucionAlmacenada | null> {
  const [fila] = await db
    .select({
      solicitud: solicitudesDevolucion,
      pedidoNumero: pedidos.numeroPedido,
      pedidoTotal: pedidos.total,
    })
    .from(solicitudesDevolucion)
    .innerJoin(pedidos, eq(solicitudesDevolucion.pedidoId, pedidos.id))
    .where(eq(solicitudesDevolucion.id, id))
    .limit(1);
  return fila ? aSolicitudAlmacenada(fila.solicitud, fila.pedidoNumero, fila.pedidoTotal) : null;
}

/** Ya existe una solicitud activa (no rechazada) para ese pedido — evita
 * que el cliente mande varias solicitudes duplicadas por el mismo pedido. */
export async function tieneSolicitudActiva(pedidoId: string) {
  const [fila] = await db
    .select({ id: solicitudesDevolucion.id })
    .from(solicitudesDevolucion)
    .where(
      and(eq(solicitudesDevolucion.pedidoId, pedidoId), ne(solicitudesDevolucion.estado, "rechazada")),
    )
    .limit(1);
  return Boolean(fila);
}

/** Solo el conteo, para la campana de notificaciones del admin. */
export async function contarSolicitudesPendientes() {
  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(solicitudesDevolucion)
    .where(eq(solicitudesDevolucion.estado, "pendiente"));
  return total;
}

export async function aprobarSolicitud(id: string) {
  await db
    .update(solicitudesDevolucion)
    .set({ estado: "aprobada" })
    .where(eq(solicitudesDevolucion.id, id));
  const solicitud = await obtenerSolicitud(id);
  if (!solicitud) throw new Error("Solicitud no encontrada");
  return solicitud;
}

export async function rechazarSolicitud(id: string, notaAdmin: string) {
  await db
    .update(solicitudesDevolucion)
    .set({ estado: "rechazada", notaAdmin, resueltoEn: new Date() })
    .where(eq(solicitudesDevolucion.id, id));
  const solicitud = await obtenerSolicitud(id);
  if (!solicitud) throw new Error("Solicitud no encontrada");
  return solicitud;
}

/** Marca el reembolso como procesado: actualiza la solicitud, pasa el
 * pedido a "reembolsado" y devuelve al inventario lo comprado — todo en
 * una transacción para que quede consistente si algo falla a medio camino. */
export async function completarReembolso(id: string, montoReembolsado: number) {
  await db.transaction(async (tx) => {
    const [solicitudFila] = await tx
      .select()
      .from(solicitudesDevolucion)
      .where(eq(solicitudesDevolucion.id, id))
      .limit(1);
    if (!solicitudFila) throw new Error("Solicitud no encontrada");
    if (solicitudFila.estado !== "aprobada") {
      throw new Error("Solo se puede procesar el reembolso de una solicitud ya aprobada.");
    }

    await tx
      .update(solicitudesDevolucion)
      .set({
        estado: "completada",
        montoReembolsado: montoReembolsado.toFixed(2),
        resueltoEn: new Date(),
      })
      .where(eq(solicitudesDevolucion.id, id));

    await tx
      .update(pedidos)
      .set({ estado: "reembolsado", updatedAt: new Date() })
      .where(eq(pedidos.id, solicitudFila.pedidoId));

    const items = await tx
      .select()
      .from(pedidoItems)
      .where(eq(pedidoItems.pedidoId, solicitudFila.pedidoId));
    for (const item of items) {
      if (!item.productoId) continue;
      await restaurarStock(item.productoId, item.varianteId, item.cantidad, tx);
    }
  });

  const solicitud = await obtenerSolicitud(id);
  if (!solicitud) throw new Error("Solicitud no encontrada");
  return solicitud;
}
