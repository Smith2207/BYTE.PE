"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { crearUsuario } from "@/lib/usuarios/store";
import { passwordValida, MENSAJE_PASSWORD_INVALIDA } from "@/lib/validations/password";
import { intentoPermitido } from "@/lib/seguridad/rate-limit";

const registroSchema = z.object({
  nombre: z.string().min(2, "Ingresa tu nombre"),
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().refine(passwordValida, MENSAJE_PASSWORD_INVALIDA),
});

// 10 cuentas nuevas por IP cada hora — no afecta el uso normal, sí frena
// scripts creando cuentas en masa.
const LIMITE_REGISTRO = { max: 10, ventanaMs: 60 * 60 * 1000 };

function obtenerIp() {
  const forwardedFor = headers().get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() ?? "desconocida";
}

export async function registrarUsuarioAction(input: {
  nombre: string;
  email: string;
  password: string;
}) {
  const { permitido, reintentarEnMinutos } = await intentoPermitido(
    `registro:${obtenerIp()}`,
    LIMITE_REGISTRO,
  );
  if (!permitido) {
    throw new Error(`Demasiadas cuentas creadas seguidas. Intenta de nuevo en ${reintentarEnMinutos} minutos.`);
  }

  const datos = registroSchema.parse(input);
  await crearUsuario(datos);
  return { ok: true };
}
