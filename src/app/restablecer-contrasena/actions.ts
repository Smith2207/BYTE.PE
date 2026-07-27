"use server";

import { z } from "zod";
import { restablecerPasswordConToken } from "@/lib/usuarios/store";
import { passwordValida, MENSAJE_PASSWORD_INVALIDA } from "@/lib/validations/password";

const passwordSchema = z.string().refine(passwordValida, MENSAJE_PASSWORD_INVALIDA);

export async function restablecerPasswordAction(token: string, password: string) {
  const nuevaPassword = passwordSchema.parse(password);
  await restablecerPasswordConToken(token, nuevaPassword);
  return { ok: true };
}
