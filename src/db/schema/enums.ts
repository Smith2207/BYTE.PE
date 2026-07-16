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
// distinto de "pedidos" (ventas a clientes). "en_almacen_usa": llegó al
// casillero/almacén de EE.UU. y espera ahí (consolidación) hasta que el
// forwarder lo despacha a Perú — recién ahí cobra desaduanaje + peso.
export const estadoCompraEnum = pgEnum("estado_compra", [
  "pedido",
  "en_almacen_usa",
  "en_transito",
  "aduana",
  "recibido",
  "cancelado",
]);

export const proveedorCompraEnum = pgEnum("proveedor_compra", ["amazon", "ebay", "otro"]);

// "directo_peru": Amazon envía directo a Perú (ej. envío gratis), sin pasar
// por un forwarder — no aplica courier internacional ni "en_almacen_usa".
// "almacen_usa": pasa por un casillero/almacén en EE.UU. y de ahí un
// courier lo trae a Perú (siempre el caso en compras de eBay).
// "local": comprado dentro de Perú (ej. Lima) — no hay tramo internacional
// ni courier que trackear, solo compra y recepción.
export const tipoEnvioCompraEnum = pgEnum("tipo_envio_compra", [
  "directo_peru",
  "almacen_usa",
  "local",
]);

// Devoluciones/reembolsos de pedidos ya entregados.
export const tipoDevolucionEnum = pgEnum("tipo_devolucion", ["reembolso", "cambio"]);
export const estadoDevolucionEnum = pgEnum("estado_devolucion", [
  "pendiente",
  "aprobada",
  "rechazada",
  "completada",
]);

// Gastos operativos del negocio (no mercadería — eso ya se registra en
// "compras"), para poder ver una utilidad neta real y no solo margen bruto.
export const categoriaGastoEnum = pgEnum("categoria_gasto", [
  "alquiler",
  "marketing",
  "sueldos",
  "servicios",
  "otros",
]);

export type RolUsuario = (typeof rolUsuarioEnum.enumValues)[number];
export type TipoDocumento = (typeof tipoDocumentoEnum.enumValues)[number];
export type EstadoPedido = (typeof estadoPedidoEnum.enumValues)[number];
export type MetodoPago = (typeof metodoPagoEnum.enumValues)[number];
export type TipoCupon = (typeof tipoCuponEnum.enumValues)[number];
export type EstadoReclamo = (typeof estadoReclamoEnum.enumValues)[number];
export type EstadoCompra = (typeof estadoCompraEnum.enumValues)[number];
export type ProveedorCompra = (typeof proveedorCompraEnum.enumValues)[number];
export type TipoEnvioCompra = (typeof tipoEnvioCompraEnum.enumValues)[number];
export type TipoDevolucion = (typeof tipoDevolucionEnum.enumValues)[number];
export type EstadoDevolucion = (typeof estadoDevolucionEnum.enumValues)[number];
export type CategoriaGasto = (typeof categoriaGastoEnum.enumValues)[number];

// Estado del video de producto autogenerado (HyperFrames, servicio aparte
// en Railway) — "sin_generar" es el default para todo producto existente.
export const videoEstadoEnum = pgEnum("video_estado", [
  "sin_generar",
  "generando",
  "listo",
  "error",
]);
export type VideoEstado = (typeof videoEstadoEnum.enumValues)[number];
