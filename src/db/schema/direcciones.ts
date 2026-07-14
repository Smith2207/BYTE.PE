import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { usuarios } from "./usuarios";

export const direcciones = pgTable("direcciones", {
  id: uuid("id").defaultRandom().primaryKey(),
  // Nulo para el snapshot de envío de un pedido de invitado (sin cuenta) —
  // las direcciones GUARDADAS de un usuario siempre lo tienen.
  usuarioId: uuid("usuario_id").references(() => usuarios.id, { onDelete: "cascade" }),
  departamento: text("departamento").notNull(),
  provincia: text("provincia").notNull(),
  distrito: text("distrito").notNull(),
  // Opcional: por ahora no hacemos despacho a domicilio, el envío es por
  // agencia — esta dirección queda solo como referencia adicional.
  direccionExacta: text("direccion_exacta"),
  referencia: text("referencia"),
  esPrincipal: boolean("es_principal").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Direccion = typeof direcciones.$inferSelect;
export type NuevaDireccion = typeof direcciones.$inferInsert;
