"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { moderarResena } from "@/lib/resenas/store";
import { getProductoPorId } from "@/lib/mock/repo";
import { registrarAccion } from "@/lib/bitacora/store";

export async function moderarResenaAction(id: string, estado: "publicada" | "rechazada") {
  const [session, resena] = await Promise.all([auth(), moderarResena(id, estado)]);
  if (session?.user?.id) {
    await registrarAccion(
      { id: session.user.id, nombre: session.user.name ?? session.user.email ?? "admin" },
      "moderar_resena",
      { id, estado },
    );
  }
  revalidatePath("/admin/resenas");
  const producto = await getProductoPorId(resena.productoId);
  if (producto) revalidatePath(`/productos/${producto.slug}`);
  return resena;
}
