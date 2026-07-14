import { boolean, integer, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { tipoCuponEnum } from "./enums";

export const cupones = pgTable("cupones", {
  id: uuid("id").defaultRandom().primaryKey(),
  codigo: text("codigo").notNull().unique(),
  tipo: tipoCuponEnum("tipo").notNull(),
  valor: numeric("valor", { precision: 10, scale: 2 }).notNull(),
  montoMinimoCompra: numeric("monto_minimo_compra", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  fechaInicio: timestamp("fecha_inicio", { withTimezone: true }).notNull(),
  fechaFin: timestamp("fecha_fin", { withTimezone: true }).notNull(),
  // Nulo = sin límite de usos.
  usosMaximos: integer("usos_maximos"),
  usosActuales: integer("usos_actuales").notNull().default(0),
  activo: boolean("activo").notNull().default(true),
  // Ids de categorías a las que aplica; vacío = aplica a todo el catálogo.
  categoriasAplicables: uuid("categorias_aplicables").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Cupon = typeof cupones.$inferSelect;
export type NuevoCupon = typeof cupones.$inferInsert;
