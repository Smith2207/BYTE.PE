"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  adminCrearCupon,
  adminActualizarCupon,
  adminEliminarCupon,
  type CuponFormInput,
} from "@/lib/cupones/store";
import { registrarAccion } from "@/lib/bitacora/store";

async function bitacoraCupon(accion: string, detalle: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user?.id) return;
  await registrarAccion(
    { id: session.user.id, nombre: session.user.name ?? session.user.email ?? "admin" },
    accion,
    detalle,
  );
}

export async function crearCuponAction(input: CuponFormInput) {
  const cupon = await adminCrearCupon(input);
  await bitacoraCupon("crear_cupon", { codigo: cupon.codigo, tipo: cupon.tipo, valor: cupon.valor });
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
  await bitacoraCupon("eliminar_cupon", { id });
  revalidatePath("/admin/cupones");
}
