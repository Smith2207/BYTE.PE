"use server";

import { z } from "zod";
import { crearTokenResetPassword } from "@/lib/usuarios/store";
import { enviarCorreo } from "@/lib/email/client";
import { plantillaRecuperarContrasena } from "@/lib/email/plantillas";
import { intentoPermitido } from "@/lib/seguridad/rate-limit";

const emailSchema = z.string().email("Ingresa un correo válido");

// 3 solicitudes por correo cada hora — evita que alguien use este
// formulario para bombardear la bandeja de otra persona con correos.
const LIMITE_RESET = { max: 3, ventanaMs: 60 * 60 * 1000 };

export async function solicitarResetPasswordAction(email: string) {
  const correo = emailSchema.parse(email);

  const { permitido } = await intentoPermitido(`reset:${correo.toLowerCase()}`, LIMITE_RESET);
  if (!permitido) {
    // Mismo mensaje de éxito que el caso normal: no confirmamos ni negamos
    // que el correo existe, y tampoco delatamos que hay un límite de
    // solicitudes activo — solo dejamos de mandar el correo de más.
    return { ok: true };
  }

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
