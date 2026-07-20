import { and, eq, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { productos, usuarios, wishlist } from "@/db/schema";
import { getProductoPorId } from "@/lib/mock/repo";

export type WishlistItemAlmacenado = {
  id: string;
  usuarioId: string;
  productoId: string;
  createdAt: string;
};

export type WishlistConBajadaDePrecio = {
  wishlistId: string;
  productoId: string;
  email: string;
  precioNotificado: string | null;
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
  // Baseline: el cron de alertas solo notifica bajadas *posteriores* a
  // este momento, nunca el precio que el producto ya tenía al agregarlo.
  const producto = await getProductoPorId(productoId);
  await db.insert(wishlist).values({
    usuarioId,
    productoId,
    precioNotificado: producto ? producto.precioFinal.toFixed(2) : null,
  });
  return true;
}

/** Wishlists cuyo producto bajó de precio desde la última notificación. */
export async function listarWishlistConBajadaDePrecio(): Promise<WishlistConBajadaDePrecio[]> {
  const precioFinalSql = sql`coalesce(${productos.precioOferta}, ${productos.precio})`;
  return db
    .select({
      wishlistId: wishlist.id,
      productoId: wishlist.productoId,
      email: usuarios.email,
      precioNotificado: wishlist.precioNotificado,
    })
    .from(wishlist)
    .innerJoin(productos, eq(wishlist.productoId, productos.id))
    .innerJoin(usuarios, eq(wishlist.usuarioId, usuarios.id))
    .where(and(eq(productos.activo, true), lt(precioFinalSql, wishlist.precioNotificado)));
}

export async function actualizarPrecioNotificado(wishlistId: string, nuevoPrecio: number) {
  await db
    .update(wishlist)
    .set({ precioNotificado: nuevoPrecio.toFixed(2) })
    .where(eq(wishlist.id, wishlistId));
}
