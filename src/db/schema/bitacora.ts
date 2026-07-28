import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { usuarios } from "./usuarios";

/**
 * Auditoría de acciones sensibles del panel admin (cambios de estado de
 * pedido, eliminar producto, moderar reseña, resolver devolución...).
 * usuarioNombre queda como snapshot (no solo el FK) para que el registro
 * siga siendo legible aunque el usuario admin se elimine después.
 */
export const bitacoraAdmin = pgTable("bitacora_admin", {
  id: uuid("id").defaultRandom().primaryKey(),
  usuarioId: uuid("usuario_id").references(() => usuarios.id, { onDelete: "set null" }),
  usuarioNombre: text("usuario_nombre").notNull(),
  accion: text("accion").notNull(),
  detalle: jsonb("detalle").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type BitacoraAdmin = typeof bitacoraAdmin.$inferSelect;
