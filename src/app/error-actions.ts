"use server";

import { notificarErrorCritico } from "@/lib/monitoreo/notificar-error";

/** Llamado desde error.tsx (boundary global) — así un error no atrapado en
 * cualquier página también genera la misma alerta por correo que el resto
 * de puntos críticos, en vez de perderse en los logs de Vercel. */
export async function reportarErrorClienteAction(mensaje: string, digest?: string) {
  await notificarErrorCritico(`boundary global${digest ? ` (${digest})` : ""}`, new Error(mensaje));
}
