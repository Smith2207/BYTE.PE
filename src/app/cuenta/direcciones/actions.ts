"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { crearDireccion, eliminarDireccion, marcarDireccionPrincipal } from "@/lib/direcciones/store";

async function usuarioIdOFalla() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Debes iniciar sesión");
  return session.user.id;
}

export async function crearDireccionAction(input: {
  departamento: string;
  provincia: string;
  distrito: string;
  direccionExacta?: string;
  referencia?: string;
  esPrincipal: boolean;
}) {
  const usuarioId = await usuarioIdOFalla();
  const direccion = await crearDireccion({ ...input, usuarioId });
  revalidatePath("/cuenta/direcciones");
  return direccion;
}

export async function eliminarDireccionAction(id: string) {
  const usuarioId = await usuarioIdOFalla();
  await eliminarDireccion(id, usuarioId);
  revalidatePath("/cuenta/direcciones");
}

export async function marcarDireccionPrincipalAction(id: string) {
  const usuarioId = await usuarioIdOFalla();
  await marcarDireccionPrincipal(id, usuarioId);
  revalidatePath("/cuenta/direcciones");
}
