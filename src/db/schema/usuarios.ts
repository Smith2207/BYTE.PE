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
