import { boolean, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { productos } from "./catalogo";
import { tipoDocumentoEnum, estadoReclamoEnum } from "./enums";
import { pedidos } from "./pedidos";

// "Avísame cuando vuelva" — captura de email para productos agotados.
export const avisosStock = pgTable("avisos_stock", {
  id: uuid("id").defaultRandom().primaryKey(),
  productoId: uuid("producto_id")
    .notNull()
    .references(() => productos.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  notificado: boolean("notificado").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Libro de Reclamaciones virtual — obligatorio por ley (INDECOPI) para
// cualquier negocio con canal online en Perú.
export const reclamos = pgTable("reclamos", {
  id: uuid("id").defaultRandom().primaryKey(),
  folio: text("folio").notNull().unique(),
  tipo: text("tipo").notNull(), // 'reclamo' | 'queja'
  tipoDocumento: tipoDocumentoEnum("tipo_documento").notNull(),
  numeroDocumento: text("numero_documento").notNull(),
  nombre: text("nombre").notNull(),
  apellidos: text("apellidos"),
  domicilio: text("domicilio"),
  telefono: text("telefono"),
  email: text("email").notNull(),
  esMenorEdad: boolean("es_menor_edad").notNull().default(false),
  tipoBien: text("tipo_bien"), // 'producto' | 'servicio'
  montoReclamado: numeric("monto_reclamado", { precision: 10, scale: 2 }),
  descripcionBien: text("descripcion_bien"),
  detalleReclamo: text("detalle_reclamo").notNull(),
  pedidoAsociadoId: uuid("pedido_asociado_id").references(() => pedidos.id),
  estado: estadoReclamoEnum("estado").notNull().default("registrado"),
  respuesta: text("respuesta"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AvisoStock = typeof avisosStock.$inferSelect;
export type Reclamo = typeof reclamos.$inferSelect;
export type NuevoReclamo = typeof reclamos.$inferInsert;
