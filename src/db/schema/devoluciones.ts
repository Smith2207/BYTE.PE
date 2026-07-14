import { numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { estadoDevolucionEnum, tipoDevolucionEnum } from "./enums";
import { pedidos } from "./pedidos";
import { usuarios } from "./usuarios";

/**
 * Solicitud de devolución/reembolso sobre un pedido ya entregado. Al
 * completarse (ver completarReembolso en el store), el pedido pasa a
 * estado "reembolsado" y se restaura el stock de los productos —
 * distinto de un reclamo (Libro de Reclamaciones), que no implica
 * necesariamente devolver dinero ni mercadería.
 */
export const solicitudesDevolucion = pgTable("solicitudes_devolucion", {
  id: uuid("id").defaultRandom().primaryKey(),
  pedidoId: uuid("pedido_id")
    .notNull()
    .references(() => pedidos.id, { onDelete: "cascade" }),
  usuarioId: uuid("usuario_id").references(() => usuarios.id, { onDelete: "set null" }),
  tipo: tipoDevolucionEnum("tipo").notNull(),
  motivo: text("motivo").notNull(),
  estado: estadoDevolucionEnum("estado").notNull().default("pendiente"),
  // Razón de rechazo o comentario interno del admin — no siempre se envía al cliente.
  notaAdmin: text("nota_admin"),
  montoReembolsado: numeric("monto_reembolsado", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  resueltoEn: timestamp("resuelto_en", { withTimezone: true }),
});

export type SolicitudDevolucion = typeof solicitudesDevolucion.$inferSelect;
export type NuevaSolicitudDevolucion = typeof solicitudesDevolucion.$inferInsert;
