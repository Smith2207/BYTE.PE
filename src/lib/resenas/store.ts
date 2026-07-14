import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { resenas, usuarios } from "@/db/schema";

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
