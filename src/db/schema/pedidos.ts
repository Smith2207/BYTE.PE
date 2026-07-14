import {
  boolean,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { estadoPedidoEnum, metodoPagoEnum, tipoDocumentoEnum } from "./enums";
import { usuarios } from "./usuarios";
import { direcciones } from "./direcciones";
import { cupones } from "./cupones";
import { productos, variantesProducto } from "./catalogo";

export const pedidos = pgTable("pedidos", {
  id: uuid("id").defaultRandom().primaryKey(),
  // Nulo permite dejar la puerta abierta a checkout de invitado a futuro.
  usuarioId: uuid("usuario_id").references(() => usuarios.id),
  numeroPedido: text("numero_pedido").notNull().unique(),
  estado: estadoPedidoEnum("estado").notNull().default("pendiente"),

  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  igv: numeric("igv", { precision: 10, scale: 2 }).notNull(),
  descuento: numeric("descuento", { precision: 10, scale: 2 }).notNull().default("0"),
  costoEnvio: numeric("costo_envio", { precision: 10, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),

  cuponId: uuid("cupon_id").references(() => cupones.id),
  direccionEnvioId: uuid("direccion_envio_id").references(() => direcciones.id),

  // El admin completa esto manualmente al despachar (courier sin API pública propia).
  courier: text("courier"),
  numeroTracking: text("numero_tracking"),

  metodoPago: metodoPagoEnum("metodo_pago"),
  // Captura del comprobante de Yape/Plin/transferencia para verificación manual.
  comprobantePagoUrl: text("comprobante_pago_url"),

  // Documento del pedido (no del registro de usuario) — para comprobante SUNAT y entrega del courier.
  tipoDocumento: tipoDocumentoEnum("tipo_documento").notNull(),
  docComprador: text("doc_comprador").notNull(),
  nombreComprador: text("nombre_comprador").notNull(),
  telefonoComprador: text("telefono_comprador").notNull(),
  emailComprador: text("email_comprador").notNull(),

  requiereFactura: boolean("requiere_factura").notNull().default(false),
  ruc: varchar("ruc", { length: 11 }),
  razonSocial: text("razon_social"),

  // Si el destinatario del envío es distinto al comprador.
  tipoDocumentoDestinatario: tipoDocumentoEnum("tipo_documento_destinatario"),
  docDestinatario: text("doc_destinatario"),
  nombreDestinatario: text("nombre_destinatario"),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pedidoItems = pgTable("pedido_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  pedidoId: uuid("pedido_id")
    .notNull()
    .references(() => pedidos.id, { onDelete: "cascade" }),
  productoId: uuid("producto_id").references(() => productos.id),
  varianteId: uuid("variante_id").references(() => variantesProducto.id),
  // Snapshot del nombre al momento de compra (el producto puede cambiar/borrarse después).
  nombreProducto: text("nombre_producto").notNull(),
  // Texto combinado de todos los atributos elegidos (ej. "Negro · 256GB") —
  // el carrito solo guarda un varianteId "principal", así que el label se
  // conserva aparte para mostrarlo tal cual en la boleta/pedido.
  varianteLabel: text("variante_label"),
  cantidad: integer("cantidad").notNull(),
  precioUnitario: numeric("precio_unitario", { precision: 10, scale: 2 }).notNull(),
});

// Auditoría de uso de cupones, para impedir reutilización fraudulenta.
export const cuponUsos = pgTable("cupon_usos", {
  id: uuid("id").defaultRandom().primaryKey(),
  cuponId: uuid("cupon_id")
    .notNull()
    .references(() => cupones.id, { onDelete: "cascade" }),
  usuarioId: uuid("usuario_id").references(() => usuarios.id),
  pedidoId: uuid("pedido_id").references(() => pedidos.id),
  usadoEn: timestamp("usado_en", { withTimezone: true }).notNull().defaultNow(),
});

export type Pedido = typeof pedidos.$inferSelect;
export type NuevoPedido = typeof pedidos.$inferInsert;
export type PedidoItem = typeof pedidoItems.$inferSelect;
export type NuevoPedidoItem = typeof pedidoItems.$inferInsert;
export type CuponUso = typeof cuponUsos.$inferSelect;
