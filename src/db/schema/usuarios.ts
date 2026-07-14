import { boolean, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
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
