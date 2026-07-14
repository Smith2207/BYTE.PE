import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { wishlist } from "@/db/schema";

export type WishlistItemAlmacenado = {
  id: string;
  usuarioId: string;
  productoId: string;
  createdAt: string;
};

export async function listarWishlistPorUsuario(usuarioId: string) {
  const filas = await db.select().from(wishlist).where(eq(wishlist.usuarioId, usuarioId));
  return filas.map((w) => ({
    id: w.id,
    usuarioId: w.usuarioId,
    productoId: w.productoId,
    createdAt: w.createdAt.toISOString(),
  }));
}

export async function estaEnWishlist(usuarioId: string, productoId: string) {
  const [fila] = await db
    .select({ id: wishlist.id })
    .from(wishlist)
    .where(and(eq(wishlist.usuarioId, usuarioId), eq(wishlist.productoId, productoId)))
    .limit(1);
  return Boolean(fila);
}

/** Devuelve true si quedó agregado, false si quedó quitado. */
export async function alternarWishlist(usuarioId: string, productoId: string) {
  const [existente] = await db
    .select({ id: wishlist.id })
    .from(wishlist)
    .where(and(eq(wishlist.usuarioId, usuarioId), eq(wishlist.productoId, productoId)))
    .limit(1);

  if (existente) {
    await db.delete(wishlist).where(eq(wishlist.id, existente.id));
    return false;
  }
  await db.insert(wishlist).values({ usuarioId, productoId });
  return true;
}
