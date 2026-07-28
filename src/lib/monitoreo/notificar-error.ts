import { enviarCorreo } from "@/lib/email/client";
import { intentoPermitido } from "@/lib/seguridad/rate-limit";

/**
 * Alerta mínima de errores en producción: hoy no hay Sentry ni ningún
 * monitoreo, así que un webhook de pago fallando en silencio (token
 * vencido, Mercado Pago cambió algo) solo se nota cuando un cliente
 * reclama que pagó y su pedido nunca se marcó. Esto manda un correo al
 * admin (reusa la misma cuenta de EMAIL_USER que ya existe para pedidos)
 * — no reemplaza una herramienta real de observabilidad, pero cierra el
 * punto ciego más caro sin agregar un proveedor nuevo que no se pueda
 * verificar en este entorno.
 *
 * Limitado a 5 avisos por hora por `contexto`: si algo empieza a fallar
 * en bucle (ej. token de Mercado Pago vencido y el webhook reintentando),
 * un solo aviso ya avisa — no hace falta inundar el correo del admin.
 */
export async function notificarErrorCritico(contexto: string, error: unknown) {
  console.error(`[error crítico] ${contexto}:`, error);

  if (!process.env.EMAIL_USER) return;

  const { permitido } = await intentoPermitido(`alerta-error:${contexto}`, {
    max: 5,
    ventanaMs: 60 * 60 * 1000,
  });
  if (!permitido) return;

  const detalle = error instanceof Error ? `${error.message}\n\n${error.stack ?? ""}` : String(error);

  await enviarCorreo({
    para: process.env.EMAIL_USER,
    asunto: `⚠️ Error en producción: ${contexto}`,
    html: `<pre style="white-space:pre-wrap;font-family:monospace;font-size:12px;">${detalle
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")}</pre>`,
  });
}
