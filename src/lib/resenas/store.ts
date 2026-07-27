import { and, desc, eq, gte, isNotNull, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { resenas, usuarios, productos, pedidos, pedidoItems } from "@/db/schema";
import type { EstadoResena } from "@/db/schema/enums";

export type ResenaDestacada = {
  id: string;
  usuarioNombre: string;
  calificacion: number;
  comentario: string;
  createdAt: string;
  productoNombre: string;
  productoSlug: string;
};

export type ResenaAlmacenada = {
  id: string;
  productoId: string;
  usuarioId: string;
  usuarioNombre: string;
  calificacion: number;
  comentario: string;
  fotoUrl?: string;
  compraVerificada: boolean;
  estado: EstadoResena;
  createdAt: string;
};

function aResenaAlmacenada(r: {
  id: string;
  productoId: string;
  usuarioId: string;
  usuarioNombre: string;
  calificacion: number;
  comentario: string | null;
  fotoUrl: string | null;
  compraVerificada: boolean;
  estado: EstadoResena;
  createdAt: Date;
}): ResenaAlmacenada {
  return {
    id: r.id,
    productoId: r.productoId,
    usuarioId: r.usuarioId,
    usuarioNombre: r.usuarioNombre,
    calificacion: r.calificacion,
    comentario: r.comentario ?? "",
    fotoUrl: r.fotoUrl ?? undefined,
    compraVerificada: r.compraVerificada,
    estado: r.estado,
    createdAt: r.createdAt.toISOString(),
  };
}

/** Reseñas visibles públicamente en la ficha de producto — solo las que
 * un admin ya aprobó (ver /admin/resenas). */
export async function listarResenasPorProducto(productoId: string): Promise<ResenaAlmacenada[]> {
  const filas = await db
    .select({
      id: resenas.id,
      productoId: resenas.productoId,
      usuarioId: resenas.usuarioId,
      usuarioNombre: usuarios.nombre,
      calificacion: resenas.calificacion,
      comentario: resenas.comentario,
      fotoUrl: resenas.fotoUrl,
      compraVerificada: resenas.compraVerificada,
      estado: resenas.estado,
      createdAt: resenas.createdAt,
    })
    .from(resenas)
    .innerJoin(usuarios, eq(resenas.usuarioId, usuarios.id))
    .where(and(eq(resenas.productoId, productoId), eq(resenas.estado, "publicada")))
    .orderBy(desc(resenas.createdAt));

  return filas.map(aResenaAlmacenada);
}

/** La reseña del usuario actual sobre este producto, publicada o no —
 * para que la vea su propio autor aunque siga pendiente de moderación,
 * y para que el formulario sepa si ya dejó una y no ofrezca duplicarla. */
export async function obtenerResenaDeUsuario(
  productoId: string,
  usuarioId: string,
): Promise<ResenaAlmacenada | null> {
  const [fila] = await db
    .select({
      id: resenas.id,
      productoId: resenas.productoId,
      usuarioId: resenas.usuarioId,
      usuarioNombre: usuarios.nombre,
      calificacion: resenas.calificacion,
      comentario: resenas.comentario,
      fotoUrl: resenas.fotoUrl,
      compraVerificada: resenas.compraVerificada,
      estado: resenas.estado,
      createdAt: resenas.createdAt,
    })
    .from(resenas)
    .innerJoin(usuarios, eq(resenas.usuarioId, usuarios.id))
    .where(and(eq(resenas.productoId, productoId), eq(resenas.usuarioId, usuarioId)))
    .limit(1);
  return fila ? aResenaAlmacenada(fila) : null;
}

export async function promedioCalificacion(productoId: string) {
  const resenasProducto = await listarResenasPorProducto(productoId);
  if (resenasProducto.length === 0) return { promedio: 0, total: 0 };
  const suma = resenasProducto.reduce((acc, r) => acc + r.calificacion, 0);
  return {
    promedio: Math.round((suma / resenasProducto.length) * 10) / 10,
    total: resenasProducto.length,
  };
}

/**
 * Reseñas destacadas de TODO el catálogo (no de un producto puntual) para
 * la sección de testimonios del home. Solo calificación alta y con un
 * comentario real de al menos 15 caracteres — si no hay suficientes
 * todavía, devuelve un array corto o vacío (nunca se inventa contenido).
 */
export async function listarResenasDestacadas(limit = 3): Promise<ResenaDestacada[]> {
  const filas = await db
    .select({
      id: resenas.id,
      usuarioNombre: usuarios.nombre,
      calificacion: resenas.calificacion,
      comentario: resenas.comentario,
      createdAt: resenas.createdAt,
      productoNombre: productos.nombre,
      productoSlug: productos.slug,
    })
    .from(resenas)
    .innerJoin(usuarios, eq(resenas.usuarioId, usuarios.id))
    .innerJoin(productos, eq(resenas.productoId, productos.id))
    .where(
      and(
        eq(resenas.estado, "publicada"),
        gte(resenas.calificacion, 4),
        isNotNull(resenas.comentario),
        sql`length(${resenas.comentario}) >= 15`,
      ),
    )
    .orderBy(desc(resenas.calificacion), desc(resenas.createdAt))
    .limit(limit);

  return filas.map((f) => ({
    ...f,
    comentario: f.comentario!,
    createdAt: f.createdAt.toISOString(),
  }));
}

/** Compra verificada = el usuario tiene al menos un pedido no cancelado
 * que incluye este producto. Usado para el badge "Compra verificada" y
 * para priorizar la moderación, no para bloquear reseñas de quien no
 * compró (cualquier usuario logueado puede opinar, pero se distingue). */
async function tieneCompraDelProducto(usuarioId: string, productoId: string) {
  const [fila] = await db
    .select({ id: pedidoItems.id })
    .from(pedidoItems)
    .innerJoin(pedidos, eq(pedidoItems.pedidoId, pedidos.id))
    .where(
      and(
        eq(pedidos.usuarioId, usuarioId),
        eq(pedidoItems.productoId, productoId),
        ne(pedidos.estado, "cancelado"),
      ),
    )
    .limit(1);
  return Boolean(fila);
}

export async function crearResena(
  input: Omit<ResenaAlmacenada, "id" | "createdAt" | "usuarioNombre" | "compraVerificada" | "estado">,
) {
  const yaExiste = await obtenerResenaDeUsuario(input.productoId, input.usuarioId);
  if (yaExiste) throw new Error("Ya dejaste una reseña para este producto.");

  const compraVerificada = await tieneCompraDelProducto(input.usuarioId, input.productoId);

  const [fila] = await db
    .insert(resenas)
    .values({
      productoId: input.productoId,
      usuarioId: input.usuarioId,
      calificacion: input.calificacion,
      comentario: input.comentario,
      fotoUrl: input.fotoUrl,
      compraVerificada,
      estado: "pendiente",
    })
    .returning();
  return fila;
}

// ---------- Moderación (admin) ----------

export type ResenaModeracion = ResenaAlmacenada & {
  productoNombre: string;
  productoSlug: string;
};

export async function adminListarResenas(): Promise<ResenaModeracion[]> {
  const filas = await db
    .select({
      id: resenas.id,
      productoId: resenas.productoId,
      usuarioId: resenas.usuarioId,
      usuarioNombre: usuarios.nombre,
      calificacion: resenas.calificacion,
      comentario: resenas.comentario,
      fotoUrl: resenas.fotoUrl,
      compraVerificada: resenas.compraVerificada,
      estado: resenas.estado,
      createdAt: resenas.createdAt,
      productoNombre: productos.nombre,
      productoSlug: productos.slug,
    })
    .from(resenas)
    .innerJoin(usuarios, eq(resenas.usuarioId, usuarios.id))
    .innerJoin(productos, eq(resenas.productoId, productos.id))
    .orderBy(desc(resenas.createdAt));

  return filas.map((f) => ({ ...aResenaAlmacenada(f), productoNombre: f.productoNombre, productoSlug: f.productoSlug }));
}

/** Solo el conteo, para la campana de notificaciones del admin. */
export async function contarResenasPendientes() {
  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(resenas)
    .where(eq(resenas.estado, "pendiente"));
  return total;
}

export async function moderarResena(id: string, estado: "publicada" | "rechazada") {
  const [fila] = await db.update(resenas).set({ estado }).where(eq(resenas.id, id)).returning();
  if (!fila) throw new Error("Reseña no encontrada");
  return fila;
}
