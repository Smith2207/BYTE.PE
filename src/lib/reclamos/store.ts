import { desc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { reclamos, pedidos } from "@/db/schema";
import type { EstadoReclamo, TipoDocumento } from "@/db/schema/enums";

export type ReclamoAlmacenado = {
  id: string;
  folio: string;
  tipo: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  nombre: string;
  apellidos: string | null;
  domicilio: string | null;
  telefono: string | null;
  email: string;
  esMenorEdad: boolean;
  tipoBien: string | null;
  montoReclamado: number | null;
  descripcionBien: string | null;
  detalleReclamo: string;
  pedidoNumero: string | null;
  estado: EstadoReclamo;
  respuesta: string | null;
  createdAt: string;
};

function aReclamoAlmacenado(
  r: typeof reclamos.$inferSelect,
  pedidoNumero: string | null,
): ReclamoAlmacenado {
  return {
    id: r.id,
    folio: r.folio,
    tipo: r.tipo,
    tipoDocumento: r.tipoDocumento,
    numeroDocumento: r.numeroDocumento,
    nombre: r.nombre,
    apellidos: r.apellidos,
    domicilio: r.domicilio,
    telefono: r.telefono,
    email: r.email,
    esMenorEdad: r.esMenorEdad,
    tipoBien: r.tipoBien,
    montoReclamado: r.montoReclamado != null ? Number(r.montoReclamado) : null,
    descripcionBien: r.descripcionBien,
    detalleReclamo: r.detalleReclamo,
    pedidoNumero,
    estado: r.estado,
    respuesta: r.respuesta,
    createdAt: r.createdAt.toISOString(),
  };
}

export async function listarReclamos(): Promise<ReclamoAlmacenado[]> {
  const filas = await db
    .select({ reclamo: reclamos, pedidoNumero: pedidos.numeroPedido })
    .from(reclamos)
    .leftJoin(pedidos, eq(reclamos.pedidoAsociadoId, pedidos.id))
    .orderBy(desc(reclamos.createdAt));
  return filas.map((f) => aReclamoAlmacenado(f.reclamo, f.pedidoNumero));
}

export async function obtenerReclamo(id: string): Promise<ReclamoAlmacenado | null> {
  const [fila] = await db
    .select({ reclamo: reclamos, pedidoNumero: pedidos.numeroPedido })
    .from(reclamos)
    .leftJoin(pedidos, eq(reclamos.pedidoAsociadoId, pedidos.id))
    .where(eq(reclamos.id, id))
    .limit(1);
  return fila ? aReclamoAlmacenado(fila.reclamo, fila.pedidoNumero) : null;
}

/** Solo el conteo, para la campana de notificaciones del admin. */
export async function contarReclamosPendientes() {
  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(reclamos)
    .where(ne(reclamos.estado, "resuelto"));
  return total;
}

export async function actualizarReclamo(
  id: string,
  input: { estado: EstadoReclamo; respuesta?: string },
): Promise<ReclamoAlmacenado> {
  const [fila] = await db
    .update(reclamos)
    .set({ estado: input.estado, respuesta: input.respuesta })
    .where(eq(reclamos.id, id))
    .returning();
  if (!fila) throw new Error("Reclamo no encontrado");
  const reclamo = await obtenerReclamo(fila.id);
  if (!reclamo) throw new Error("Reclamo no encontrado");
  return reclamo;
}
