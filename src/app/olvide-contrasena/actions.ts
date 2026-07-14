"use server";

import { z } from "zod";
import { crearTokenResetPassword } from "@/lib/usuarios/store";
import { enviarCorreo } from "@/lib/email/client";
import { plantillaRecuperarContrasena } from "@/lib/email/plantillas";

const emailSchema = z.string().email("Ingresa un correo válido");

export async function solicitarResetPasswordAction(email: string) {
  const correo = emailSchema.parse(email);
  const resultado = await crearTokenResetPassword(correo);

  // Mismo resultado exista o no la cuenta: no revelamos qué correos están
  // registrados. Si sí existe, se envía el correo real en segundo plano.
  if (resultado) {
    await enviarCorreo({
      para: correo,
      asunto: "Recupera tu contraseña",
      html: plantillaRecuperarContrasena(resultado.nombre, resultado.token),
    });
  }

  return { ok: true };
}
