"use server";

import { revalidatePath } from "next/cache";
import {
  adminCrearProducto,
  adminActualizarProducto,
  adminEliminarProducto,
  type ProductoFormInput,
} from "@/lib/mock/repo";

export async function crearProductoAction(input: ProductoFormInput) {
  const producto = await adminCrearProducto(input);
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  return producto;
}

export async function actualizarProductoAction(id: string, input: Partial<ProductoFormInput>) {
  const producto = await adminActualizarProducto(id, input);
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  revalidatePath(`/productos/${producto.slug}`);
  return producto;
}

export async function eliminarProductoAction(id: string) {
  await adminEliminarProducto(id);
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
}
