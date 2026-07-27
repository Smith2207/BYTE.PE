"use server";

import { revalidatePath } from "next/cache";
import { moderarResena } from "@/lib/resenas/store";
import { getProductoPorId } from "@/lib/mock/repo";

export async function moderarResenaAction(id: string, estado: "publicada" | "rechazada") {
  const resena = await moderarResena(id, estado);
  revalidatePath("/admin/resenas");
  const producto = await getProductoPorId(resena.productoId);
  if (producto) revalidatePath(`/productos/${producto.slug}`);
  return resena;
}
