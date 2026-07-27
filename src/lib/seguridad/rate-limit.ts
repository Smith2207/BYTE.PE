import { and, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { intentosSeguridad } from "@/db/schema";

/**
 * Rate limiting simple por ventana deslizante, contra Postgres (no hay
 * Redis en este proyecto y el volumen de auth no lo justifica). Se apoya
 * en una sola tabla (`intentos_seguridad`): cada llamada poda de paso los
 * intentos de esa `clave` ya fuera de la ventana, así la tabla no crece
 * indefinidamente sin necesidad de un job de limpieza aparte.
 */

async function podarYContar(clave: string, ventanaMs: number) {
  const desde = new Date(Date.now() - ventanaMs);
  await db
    .delete(intentosSeguridad)
    .where(and(eq(intentosSeguridad.clave, clave), lt(intentosSeguridad.createdAt, desde)));

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(intentosSeguridad)
    .where(and(eq(intentosSeguridad.clave, clave), gte(intentosSeguridad.createdAt, desde)));
  return total;
}

/**
 * Para acciones donde CADA solicitud consume el recurso a proteger (crear
 * cuenta, mandar un correo de reset) sin importar si terminó bien: cuenta
 * y, si hay cupo, registra el intento en el mismo paso.
 */
export async function intentoPermitido(
  clave: string,
  opts: { max: number; ventanaMs: number },
): Promise<{ permitido: boolean; reintentarEnMinutos: number }> {
  const total = await podarYContar(clave, opts.ventanaMs);
  if (total >= opts.max) {
    return { permitido: false, reintentarEnMinutos: Math.ceil(opts.ventanaMs / 60_000) };
  }
  await db.insert(intentosSeguridad).values({ clave });
  return { permitido: true, reintentarEnMinutos: 0 };
}

/**
 * Para login: solo los intentos FALLIDOS deben contar contra el límite —
 * un usuario que entra y sale de sesión varias veces con la contraseña
 * correcta no debe terminar bloqueado. `superoLimiteDeFallos` solo
 * consulta; `registrarFallo` se llama aparte, tras confirmar que la
 * contraseña no era válida.
 */
export async function superoLimiteDeFallos(
  clave: string,
  opts: { max: number; ventanaMs: number },
): Promise<boolean> {
  const total = await podarYContar(clave, opts.ventanaMs);
  return total >= opts.max;
}

export async function registrarFallo(clave: string) {
  await db.insert(intentosSeguridad).values({ clave });
}
