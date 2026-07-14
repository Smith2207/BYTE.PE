import { integer, numeric, pgTable, text, uuid } from "drizzle-orm/pg-core";

// Tarifas fijas propias mientras no haya integración directa con couriers
// (Olva/Shalom no dan API sin contrato comercial). El costo se estima en
// checkout según el departamento de destino.
export const tarifasEnvio = pgTable("tarifas_envio", {
  id: uuid("id").defaultRandom().primaryKey(),
  departamento: text("departamento").notNull().unique(),
  costo: numeric("costo", { precision: 10, scale: 2 }).notNull(),
  diasEstimadosMin: integer("dias_estimados_min").notNull().default(2),
  diasEstimadosMax: integer("dias_estimados_max").notNull().default(5),
});

export type TarifaEnvio = typeof tarifasEnvio.$inferSelect;
export type NuevaTarifaEnvio = typeof tarifasEnvio.$inferInsert;
