"use server";

import { revalidatePath } from "next/cache";
import {
  adminCrearCupon,
  adminActualizarCupon,
  adminEliminarCupon,
  type CuponFormInput,
} from "@/lib/cupones/store";

export async function crearCuponAction(input: CuponFormInput) {
  const cupon = await adminCrearCupon(input);
  revalidatePath("/admin/cupones");
  return cupon;
}

export async function actualizarCuponAction(
  id: string,
  input: Partial<CuponFormInput & { activo: boolean }>,
) {
  const cupon = await adminActualizarCupon(id, input);
  revalidatePath("/admin/cupones");
  return cupon;
}

export async function eliminarCuponAction(id: string) {
  await adminEliminarCupon(id);
  revalidatePath("/admin/cupones");
}
