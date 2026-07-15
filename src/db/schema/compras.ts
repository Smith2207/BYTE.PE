import { boolean, integer, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { estadoCompraEnum, proveedorCompraEnum, tipoEnvioCompraEnum } from "./enums";
import { categorias, productos } from "./catalogo";

/**
 * Compras a proveedores (Amazon u otros) para importar/reabastecer
 * inventario. Es información de contabilidad interna: solo el admin la
 * ve (protegido por rol, nunca expuesto en el catálogo público).
 */
export const compras = pgTable("compras", {
  id: uuid("id").defaultRandom().primaryKey(),
  proveedor: proveedorCompraEnum("proveedor").notNull(),
  proveedorNombre: text("proveedor_nombre"), // libre cuando proveedor = "otro"
  numeroOrdenExterno: text("numero_orden_externo"), // ej: número de orden de Amazon
  // "directo_peru": Amazon con envío gratis directo, sin forwarder.
  // "almacen_usa": pasa por casillero en EE.UU. y courier (siempre en eBay).
  tipoEnvio: tipoEnvioCompraEnum("tipo_envio").notNull().default("almacen_usa"),
  estado: estadoCompraEnum("estado").notNull().default("pedido"),
  fechaCompra: timestamp("fecha_compra", { withTimezone: true }).notNull().defaultNow(),
  // Cuándo llegó al casillero/almacén de EE.UU. — puede pasar buen tiempo
  // ahí (consolidación) antes de que el forwarder lo despache a Perú.
  fechaLlegadaAlmacen: timestamp("fecha_llegada_almacen", { withTimezone: true }),
  fechaRecibido: timestamp("fecha_recibido", { withTimezone: true }),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  costoEnvioImportacion: numeric("costo_envio_importacion", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  otrosCostos: numeric("otros_costos", { precision: 10, scale: 2 }).notNull().default("0"),
  // No todas las compras pagan impuestos de aduana — depende del valor
  // declarado y de cuántas importaciones sin impuestos ya usaste este año
  // (SUNAT permite un número limitado por persona, ver contarComprasDelAnio).
  pagoImpuestos: boolean("pago_impuestos").notNull().default(false),
  montoImpuestos: numeric("monto_impuestos", { precision: 10, scale: 2 }),
  costoTotal: numeric("costo_total", { precision: 10, scale: 2 }).notNull(),
  comprobanteUrls: text("comprobante_urls").array().notNull().default([]),
  notas: text("notas"),
  // Tramo internacional (USA→Perú vía forwarder: MyUS, Aerobox, JetBox...)
  // — distinto del courier que reparte localmente al cliente final.
  courierInternacional: text("courier_internacional"),
  trackingInternacional: text("tracking_internacional"),
  trackingInternacionalEstado: text("tracking_internacional_estado"), // último estado cacheado de la API de tracking
  trackingInternacionalActualizadoEn: timestamp("tracking_internacional_actualizado_en", {
    withTimezone: true,
  }),
  // Reparto dentro de Perú — el courier urbano que entrega al final, tanto
  // en compras "directo_peru" (es el único tramo) como en "almacen_usa"
  // (tramo final después de aduana).
  courierNacional: text("courier_nacional"),
  trackingNacional: text("tracking_nacional"),
  trackingNacionalEstado: text("tracking_nacional_estado"),
  trackingNacionalActualizadoEn: timestamp("tracking_nacional_actualizado_en", {
    withTimezone: true,
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const compraItems = pgTable("compra_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  compraId: uuid("compra_id")
    .notNull()
    .references(() => compras.id, { onDelete: "cascade" }),
  // Nulo si es un producto nuevo que todavía no existe en el catálogo.
  productoId: uuid("producto_id").references(() => productos.id),
  descripcion: text("descripcion").notNull(),
  cantidad: integer("cantidad").notNull(),
  costoUnitario: numeric("costo_unitario", { precision: 10, scale: 2 }).notNull(),
  // Solo se usan cuando productoId es nulo (producto nuevo que todavía no
  // existe en el catálogo): con esto se publica automáticamente al marcar
  // la compra como "recibido" (ver actualizarEstadoCompra).
  categoriaId: uuid("categoria_id").references(() => categorias.id),
  marca: text("marca"),
  precioVenta: numeric("precio_venta", { precision: 10, scale: 2 }),
  // Fotos del producto tomadas al momento de comprar — se pasan tal cual
  // al catálogo cuando se publica (ver actualizarEstadoCompra).
  imagenes: text("imagenes").array().notNull().default([]),
  // Peso unitario real — si TODOS los ítems de una compra lo tienen, el
  // costo de envío/aduana se reparte proporcional al peso en vez de en
  // partes iguales por unidad (ver actualizarEstadoCompra).
  pesoKg: numeric("peso_kg", { precision: 10, scale: 3 }),
});

export type Compra = typeof compras.$inferSelect;
export type NuevaCompra = typeof compras.$inferInsert;
export type CompraItem = typeof compraItems.$inferSelect;
export type NuevoCompraItem = typeof compraItems.$inferInsert;
