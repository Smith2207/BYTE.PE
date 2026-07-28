import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Registro de intentos para rate limiting (login fallido, registro,
 * solicitudes de reset de contraseña). Una fila por intento — se cuentan
 * las filas recientes de una `clave` para decidir si se bloquea, y se
 * podan las viejas al vuelo (ver src/lib/seguridad/rate-limit.ts). No usa
 * un servicio externo (Redis/Upstash) porque el volumen de auth de esta
 * tienda no lo justifica y ya hay Postgres a mano para todo lo demás.
 */
export const intentosSeguridad = pgTable(
  "intentos_seguridad",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clave: text("clave").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  // Toda consulta a esta tabla filtra por clave (login, registro, reset,
  // alertas de error) — sin índice, cada intento de login hace un seq
  // scan sobre TODOS los intentos de TODOS los usuarios.
  (t) => ({
    claveIdx: index("intentos_seguridad_clave_idx").on(t.clave),
  }),
);
