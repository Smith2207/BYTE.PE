import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { rolUsuarioEnum } from "./enums";

export const usuarios = pgTable("usuarios", {
  id: uuid("id").defaultRandom().primaryKey(),
  nombre: text("nombre").notNull(),
  email: text("email").notNull().unique(),
  // Null cuando el usuario se registró solo vía Google (no tiene password propio).
  passwordHash: text("password_hash"),
  dni: varchar("dni", { length: 20 }),
  telefono: varchar("telefono", { length: 20 }),
  rol: rolUsuarioEnum("rol").notNull().default("cliente"),
  imagen: text("imagen"),
  activo: boolean("activo").notNull().default(true),
  // true en cuentas de Google (Google ya confirmó el correo). En
  // credenciales, se pone en true al abrir el link de /verificar-correo.
  // No bloquea nada por sí solo (ver registro/actions.ts) — es solo una
  // señal para invitar a verificar, no una puerta de acceso.
  emailVerificado: boolean("email_verificado").notNull().default(false),
  // Se incrementa cada vez que se cambia la contraseña (ver
  // restablecerPasswordConToken). El JWT guarda la versión vigente al
  // momento de iniciar sesión — si no coincide con esta, la sesión se
  // trata como inválida aunque el token todavía no haya expirado. Sin
  // esto, cambiar la contraseña no sacaba a nadie que ya tuviera una
  // sesión abierta (ej. un dispositivo robado).
  sessionVersion: integer("session_version").notNull().default(0),
  // 2FA (TOTP) — solo se usa si totpHabilitado es true. El secreto no se
  // guarda hasta confirmar un código válido durante la activación (ver
  // /cuenta/seguridad), para no dejar 2FA "a medias" con un secreto que
  // el usuario nunca terminó de configurar.
  totpSecret: text("totp_secret"),
  totpHabilitado: boolean("totp_habilitado").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Usuario = typeof usuarios.$inferSelect;
export type NuevoUsuario = typeof usuarios.$inferInsert;

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  usuarioId: uuid("usuario_id")
    .notNull()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  // Se guarda el hash SHA-256 del token, no el valor enviado por correo —
  // igual que una contraseña, para que una fuga de la base de datos no
  // permita reusar enlaces de recuperación válidos.
  token: text("token").notNull().unique(),
  expiraEn: timestamp("expira_en", { withTimezone: true }).notNull(),
  usadoEn: timestamp("usado_en", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Mismo patrón que passwordResetTokens — un solo uso, con vencimiento,
 * hash del token (no el valor plano) guardado en la base. */
export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  usuarioId: uuid("usuario_id")
    .notNull()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiraEn: timestamp("expira_en", { withTimezone: true }).notNull(),
  usadoEn: timestamp("usado_en", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
