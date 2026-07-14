"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { alternarWishlist, estaEnWishlist } from "./store";

export async function alternarWishlistAction(productoId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Debes iniciar sesión para guardar favoritos");
  }
  const agregado = await alternarWishlist(session.user.id, productoId);
  revalidatePath("/cuenta/wishlist");
  return { agregado };
}

export async function obtenerEstadoWishlist(productoId: string) {
  const session = await auth();
  if (!session?.user?.id) return false;
  return await estaEnWishlist(session.user.id, productoId);
}
