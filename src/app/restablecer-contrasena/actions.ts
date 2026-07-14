"use server";

import { z } from "zod";
import { restablecerPasswordConToken } from "@/lib/usuarios/store";

const passwordSchema = z.string().min(6, "La contraseña debe tener al menos 6 caracteres");

export async function restablecerPasswordAction(token: string, password: string) {
  const nuevaPassword = passwordSchema.parse(password);
  await restablecerPasswordConToken(token, nuevaPassword);
  return { ok: true };
}
