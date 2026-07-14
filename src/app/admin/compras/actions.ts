"use server";

import { revalidatePath } from "next/cache";
import {
  crearCompra,
  actualizarEstadoCompra,
  type CompraFormInput,
  type CompraAlmacenada,
} from "@/lib/compras/store";

export async function crearCompraAction(input: CompraFormInput) {
  const compra = await crearCompra(input);
  revalidatePath("/admin/compras");
  revalidatePath("/admin");
  return compra;
}

export async function actualizarEstadoCompraAction(id: string, estado: CompraAlmacenada["estado"]) {
  const compra = await actualizarEstadoCompra(id, estado);
  revalidatePath("/admin/compras");
  revalidatePath(`/admin/compras/${id}`);
  revalidatePath("/admin/productos");
  revalidatePath("/admin");
  return compra;
}
