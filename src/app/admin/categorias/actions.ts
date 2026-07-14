"use server";

import { revalidatePath } from "next/cache";
import {
  adminCrearCategoria,
  adminActualizarCategoria,
  adminEliminarCategoria,
} from "@/lib/mock/repo";

export async function crearCategoriaAction(input: { nombre: string; categoriaPadreId: string | null }) {
  const categoria = await adminCrearCategoria(input);
  revalidatePath("/admin/categorias");
  revalidatePath("/productos");
  revalidatePath("/");
  return categoria;
}

export async function actualizarCategoriaAction(
  id: string,
  input: Partial<{ nombre: string; categoriaPadreId: string | null }>,
) {
  const categoria = await adminActualizarCategoria(id, input);
  revalidatePath("/admin/categorias");
  revalidatePath("/productos");
  revalidatePath("/");
  return categoria;
}

export async function eliminarCategoriaAction(id: string) {
  await adminEliminarCategoria(id);
  revalidatePath("/admin/categorias");
  revalidatePath("/productos");
  revalidatePath("/");
}
