import { boolean, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { usuarios } from "./usuarios";
import { productos, variantesProducto } from "./catalogo";

export const carritos = pgTable("carritos", {
  id: uuid("id").defaultRandom().primaryKey(),
  // Nulo para carritos de invitado (identificados solo por sessionId/cookie).
  usuarioId: uuid("usuario_id").references(() => usuarios.id, { onDelete: "cascade" }),
  sessionId: text("session_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  // Evita reenviar el correo de "carrito abandonado" más de una vez por
  // período de inactividad; se resetea a false en cada sync con actividad real.
  recordatorioEnviado: boolean("recordatorio_enviado").notNull().default(false),
});

export const carritoItems = pgTable("carrito_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  carritoId: uuid("carrito_id")
    .notNull()
    .references(() => carritos.id, { onDelete: "cascade" }),
  productoId: uuid("producto_id")
    .notNull()
    .references(() => productos.id, { onDelete: "cascade" }),
  varianteId: uuid("variante_id").references(() => variantesProducto.id, {
    onDelete: "cascade",
  }),
  cantidad: integer("cantidad").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Carrito = typeof carritos.$inferSelect;
export type NuevoCarrito = typeof carritos.$inferInsert;
export type CarritoItem = typeof carritoItems.$inferSelect;
export type NuevoCarritoItem = typeof carritoItems.$inferInsert;
