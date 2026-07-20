import type { NextRequest } from "next/server";

/**
 * Vercel Cron manda automáticamente "Authorization: Bearer $CRON_SECRET"
 * en las invocaciones programadas. Fuera de producción se permite sin
 * header para poder probar los endpoints con curl en local.
 */
export function cronAutorizado(req: NextRequest) {
  if (process.env.NODE_ENV !== "production") return true;
  const secreto = process.env.CRON_SECRET;
  if (!secreto) return false;
  return req.headers.get("authorization") === `Bearer ${secreto}`;
}
