"use server";

import { getUsuarioPorEmail } from "@/lib/usuarios/store";

/**
 * NextAuth v5 no deja llegar al cliente el `code` personalizado de un
 * error de Credentials — `signIn(..., { redirect: false })` solo expone
 * `error.type` (siempre "CredentialsSignin" genérico), el `code` real
 * queda solo en la URL de redirección interna que el cliente nunca lee
 * (ver @auth/core/index.js). Por eso el login no puede distinguir "falta
 * el código 2FA" de "contraseña incorrecta" a partir de la respuesta de
 * signIn(): login-form.tsx llama a esto aparte cuando el primer intento
 * (sin código) falla, para decidir si mostrar el campo de código o el
 * error genérico.
 *
 * No filtra si el correo existe: una cuenta inexistente y una que existe
 * sin 2FA devuelven exactamente lo mismo (`requiere: false`).
 */
export async function requiereCodigoTotpAction(email: string) {
  const usuario = await getUsuarioPorEmail(email);
  return { requiere: usuario?.totpHabilitado ?? false };
}
