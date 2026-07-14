"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { actualizarReclamo, obtenerReclamo } from "@/lib/reclamos/store";
import { enviarCorreo } from "@/lib/email/client";
import { plantillaRespuestaReclamo } from "@/lib/email/plantillas";

const respuestaSchema = z.object({
  estado: z.enum(["registrado", "en_proceso", "resuelto"]),
  respuesta: z.string().min(10, "Escribe una respuesta de al menos 10 caracteres"),
});

export async function responderReclamoAction(
  id: string,
  input: { estado: "registrado" | "en_proceso" | "resuelto"; respuesta: string },
) {
  const datos = respuestaSchema.parse(input);
  const reclamo = await actualizarReclamo(id, datos);

  await enviarCorreo({
    para: reclamo.email,
    asunto: `Actualización de tu ${reclamo.tipo} — ${reclamo.folio}`,
    html: plantillaRespuestaReclamo(reclamo),
  });

  revalidatePath("/admin/reclamos");
  return reclamo;
}

/** Cambiar solo el estado (ej. pasar a "en_proceso" sin escribir respuesta
 * todavía) — no envía correo porque no hay nada nuevo que comunicarle al
 * cliente. */
export async function cambiarEstadoReclamoAction(
  id: string,
  estado: "registrado" | "en_proceso" | "resuelto",
) {
  const actual = await obtenerReclamo(id);
  await actualizarReclamo(id, { estado, respuesta: actual?.respuesta ?? undefined });
  revalidatePath("/admin/reclamos");
}
