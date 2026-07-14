import { boolean, integer, numeric, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

/**
 * Couriers propios (Olva, Shalom, Marvisur...) para reparto local — a
 * diferencia del courier internacional (USA→Perú, ver compras.ts), este es
 * el que entrega al cliente final. Reemplaza el texto libre que tenía
 * pedidos.courier con una lista real que además guarda tarifas propias por
 * departamento, para comparar costo/tiempo entre couriers.
 */
export const couriers = pgTable("couriers", {
  id: uuid("id").defaultRandom().primaryKey(),
  nombre: text("nombre").notNull().unique(),
  // Patrón de URL de tracking con "{tracking}" como placeholder del código,
  // ej: "https://www.olvacourier.com/seguimiento?codigo={tracking}".
  trackingUrlPattern: text("tracking_url_pattern"),
  activo: boolean("activo").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tarifasCourier = pgTable(
  "tarifas_courier",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    courierId: uuid("courier_id")
      .notNull()
      .references(() => couriers.id, { onDelete: "cascade" }),
    departamento: text("departamento").notNull(),
    costo: numeric("costo", { precision: 10, scale: 2 }).notNull(),
    diasEstimadosMin: integer("dias_estimados_min").notNull().default(2),
    diasEstimadosMax: integer("dias_estimados_max").notNull().default(5),
  },
  (t) => ({
    courierDepartamentoUnico: unique().on(t.courierId, t.departamento),
  }),
);

export type Courier = typeof couriers.$inferSelect;
export type NuevoCourier = typeof couriers.$inferInsert;
export type TarifaCourier = typeof tarifasCourier.$inferSelect;
export type NuevaTarifaCourier = typeof tarifasCourier.$inferInsert;
