import { and, desc, eq, gte, isNotNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { resenas, usuarios, productos } from "@/db/schema";

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
  createdAt: string;
};

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
      createdAt: resenas.createdAt,
    })
    .from(resenas)
    .innerJoin(usuarios, eq(resenas.usuarioId, usuarios.id))
    .where(eq(resenas.productoId, productoId))
    .orderBy(desc(resenas.createdAt));

  return filas.map((r) => ({
    id: r.id,
    productoId: r.productoId,
    usuarioId: r.usuarioId,
    usuarioNombre: r.usuarioNombre,
    calificacion: r.calificacion,
    comentario: r.comentario ?? "",
    fotoUrl: r.fotoUrl ?? undefined,
    createdAt: r.createdAt.toISOString(),
  }));
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

export async function crearResena(input: Omit<ResenaAlmacenada, "id" | "createdAt" | "usuarioNombre">) {
  const [fila] = await db
    .insert(resenas)
    .values({
      productoId: input.productoId,
      usuarioId: input.usuarioId,
      calificacion: input.calificacion,
      comentario: input.comentario,
      fotoUrl: input.fotoUrl,
    })
    .returning();
  return fila;
}
