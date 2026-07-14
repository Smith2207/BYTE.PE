"use server";

import { z } from "zod";
import { crearUsuario } from "@/lib/usuarios/store";

const registroSchema = z.object({
  nombre: z.string().min(2, "Ingresa tu nombre"),
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export async function registrarUsuarioAction(input: {
  nombre: string;
  email: string;
  password: string;
}) {
  const datos = registroSchema.parse(input);
  await crearUsuario(datos);
  return { ok: true };
}
