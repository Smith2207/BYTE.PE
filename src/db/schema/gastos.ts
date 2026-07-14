import { numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { categoriaGastoEnum } from "./enums";

/**
 * Gastos operativos del negocio (alquiler, marketing, sueldos, servicios...)
 * — distinto de "compras" (mercadería para revender). Junto al margen
 * bruto de ventas, esto permite calcular una utilidad neta real en el
 * dashboard admin.
 */
export const gastos = pgTable("gastos", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoria: categoriaGastoEnum("categoria").notNull(),
  descripcion: text("descripcion").notNull(),
  monto: numeric("monto", { precision: 10, scale: 2 }).notNull(),
  fecha: timestamp("fecha", { withTimezone: true }).notNull().defaultNow(),
  comprobanteUrl: text("comprobante_url"),
  notas: text("notas"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Gasto = typeof gastos.$inferSelect;
export type NuevoGasto = typeof gastos.$inferInsert;
