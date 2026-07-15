"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { actualizarUsuario } from "@/lib/usuarios/store";

export async function actualizarPerfilAction(input: {
  nombre: string;
  telefono: string;
  dni: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Debes iniciar sesión");

  const nombre = input.nombre.trim();
  if (!nombre) throw new Error("El nombre no puede estar vacío");

  const telefono = input.telefono.trim();
  if (telefono && !/^9\d{8}$/.test(telefono)) {
    throw new Error("El teléfono debe tener 9 dígitos y empezar con 9");
  }

  const dni = input.dni.trim();
  if (dni && !/^\d{8}$/.test(dni)) {
    throw new Error("El DNI debe tener 8 dígitos");
  }

  const usuario = await actualizarUsuario(session.user.id, {
    nombre,
    telefono: telefono || null,
    dni: dni || null,
  });
  revalidatePath("/cuenta");
  return usuario;
}
