import { pgEnum } from "drizzle-orm/pg-core";

export const rolUsuarioEnum = pgEnum("rol_usuario", ["cliente", "admin"]);

export const tipoDocumentoEnum = pgEnum("tipo_documento", [
  "dni",
  "ruc",
  "ce",
  "pasaporte",
]);

export const estadoPedidoEnum = pgEnum("estado_pedido", [
  "pendiente",
  "pagado",
  "preparando",
  "enviado",
  "entregado",
  "cancelado",
  "reembolsado",
]);

export const metodoPagoEnum = pgEnum("metodo_pago", [
  "tarjeta",
  "yape",
  "plin",
  "transferencia",
  "contra_entrega",
]);

export const tipoCuponEnum = pgEnum("tipo_cupon", [
  "porcentaje",
  "monto_fijo",
  "envio_gratis",
]);

export const estadoReclamoEnum = pgEnum("estado_reclamo", [
  "registrado",
  "en_proceso",
  "resuelto",
]);

// Compras a proveedores (Amazon u otros) para reabastecer el catálogo —
// distinto de "pedidos" (ventas a clientes).
export const estadoCompraEnum = pgEnum("estado_compra", [
  "pedido",
  "en_transito",
  "aduana",
  "recibido",
  "cancelado",
]);

export const proveedorCompraEnum = pgEnum("proveedor_compra", ["amazon", "ebay", "otro"]);

// Devoluciones/reembolsos de pedidos ya entregados.
export const tipoDevolucionEnum = pgEnum("tipo_devolucion", ["reembolso", "cambio"]);
export const estadoDevolucionEnum = pgEnum("estado_devolucion", [
  "pendiente",
  "aprobada",
  "rechazada",
  "completada",
]);

export type RolUsuario = (typeof rolUsuarioEnum.enumValues)[number];
export type TipoDocumento = (typeof tipoDocumentoEnum.enumValues)[number];
export type EstadoPedido = (typeof estadoPedidoEnum.enumValues)[number];
export type MetodoPago = (typeof metodoPagoEnum.enumValues)[number];
export type TipoCupon = (typeof tipoCuponEnum.enumValues)[number];
export type EstadoReclamo = (typeof estadoReclamoEnum.enumValues)[number];
export type EstadoCompra = (typeof estadoCompraEnum.enumValues)[number];
export type ProveedorCompra = (typeof proveedorCompraEnum.enumValues)[number];
export type TipoDevolucion = (typeof tipoDevolucionEnum.enumValues)[number];
export type EstadoDevolucion = (typeof estadoDevolucionEnum.enumValues)[number];
