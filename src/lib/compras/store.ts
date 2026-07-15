import { and, desc, eq, gte, lt, ne } from "drizzle-orm";
import { db } from "@/db";
import { compras, compraItems } from "@/db/schema";
import { registrarIngresoPorCompra, adminCrearProducto } from "@/lib/mock/repo";
import type {
  ProveedorCompra as ProveedorCompraEnum,
  EstadoCompra,
  TipoEnvioCompra,
} from "@/db/schema/enums";

/**
 * Compras a proveedores (Amazon, eBay u otros) para importar/reabastecer
 * inventario — información de contabilidad interna, solo el admin la ve.
 * Sobre las tablas `compras`/`compra_items` (src/db/schema/compras.ts).
 */

export type ProveedorCompra = ProveedorCompraEnum;

export type CompraItemAlmacenado = {
  productoId: string | null;
  descripcion: string;
  cantidad: number;
  costoUnitario: number;
  // Solo se usan cuando productoId es null (producto nuevo que todavía no
  // existe en el catálogo): con esto se PUBLICA automáticamente al marcar
  // la compra como "recibido" — nunca antes, porque hasta que no llega la
  // mercadería físicamente no hay nada que vender de verdad.
  categoriaId?: string;
  marca?: string;
  precioVenta?: number;
  // Peso unitario real (kg) — si TODOS los ítems de la compra lo traen, el
  // envío/aduana se reparte por peso en vez de en partes iguales por unidad.
  pesoKg?: number;
};

export type CompraAlmacenada = {
  id: string;
  proveedor: ProveedorCompra;
  proveedorNombre?: string;
  numeroOrdenExterno?: string;
  tipoEnvio: TipoEnvioCompra;
  estado: EstadoCompra;
  fechaCompra: string;
  // Cuándo llegó al casillero/almacén de EE.UU. (antes de venir a Perú).
  fechaLlegadaAlmacen?: string;
  fechaRecibido?: string;
  items: CompraItemAlmacenado[];
  subtotal: number;
  costoEnvioImportacion: number;
  otrosCostos: number;
  // No todas las importaciones pagan impuestos de aduana — ver
  // contarComprasDelAnioSinImpuestos (SUNAT limita cuántas van sin pagar).
  pagoImpuestos: boolean;
  montoImpuestos?: number;
  costoTotal: number;
  comprobanteUrl?: string;
  notas?: string;
  // Tramo internacional USA→Perú (forwarder), distinto del courier de
  // reparto local que se asigna en el pedido al cliente.
  courierInternacional?: string;
  trackingInternacional?: string;
  createdAt: string;
};

function aCompraItemAlmacenado(i: typeof compraItems.$inferSelect): CompraItemAlmacenado {
  return {
    productoId: i.productoId,
    descripcion: i.descripcion,
    cantidad: i.cantidad,
    costoUnitario: Number(i.costoUnitario),
    categoriaId: i.categoriaId ?? undefined,
    marca: i.marca ?? undefined,
    precioVenta: i.precioVenta != null ? Number(i.precioVenta) : undefined,
    pesoKg: i.pesoKg != null ? Number(i.pesoKg) : undefined,
  };
}

async function aCompraAlmacenada(c: typeof compras.$inferSelect): Promise<CompraAlmacenada> {
  const itemsFilas = await db.select().from(compraItems).where(eq(compraItems.compraId, c.id));
  return {
    id: c.id,
    proveedor: c.proveedor,
    proveedorNombre: c.proveedorNombre ?? undefined,
    numeroOrdenExterno: c.numeroOrdenExterno ?? undefined,
    tipoEnvio: c.tipoEnvio,
    estado: c.estado,
    fechaCompra: c.fechaCompra.toISOString(),
    fechaLlegadaAlmacen: c.fechaLlegadaAlmacen?.toISOString(),
    fechaRecibido: c.fechaRecibido?.toISOString(),
    items: itemsFilas.map(aCompraItemAlmacenado),
    subtotal: Number(c.subtotal),
    costoEnvioImportacion: Number(c.costoEnvioImportacion),
    otrosCostos: Number(c.otrosCostos),
    pagoImpuestos: c.pagoImpuestos,
    montoImpuestos: c.montoImpuestos != null ? Number(c.montoImpuestos) : undefined,
    costoTotal: Number(c.costoTotal),
    comprobanteUrl: c.comprobanteUrl ?? undefined,
    notas: c.notas ?? undefined,
    courierInternacional: c.courierInternacional ?? undefined,
    trackingInternacional: c.trackingInternacional ?? undefined,
    createdAt: c.createdAt.toISOString(),
  };
}

export async function listarCompras(): Promise<CompraAlmacenada[]> {
  const filas = await db.select().from(compras).orderBy(desc(compras.fechaCompra));
  return Promise.all(filas.map(aCompraAlmacenada));
}

export async function obtenerCompra(id: string): Promise<CompraAlmacenada | null> {
  const [fila] = await db.select().from(compras).where(eq(compras.id, id)).limit(1);
  return fila ? aCompraAlmacenada(fila) : null;
}

export type CompraFormInput = {
  proveedor: ProveedorCompra;
  proveedorNombre?: string;
  numeroOrdenExterno?: string;
  tipoEnvio: TipoEnvioCompra;
  fechaCompra: string;
  items: CompraItemAlmacenado[];
  costoEnvioImportacion: number;
  otrosCostos: number;
  pagoImpuestos?: boolean;
  montoImpuestos?: number;
  comprobanteUrl?: string;
  notas?: string;
  courierInternacional?: string;
  trackingInternacional?: string;
};

export async function crearCompra(input: CompraFormInput): Promise<CompraAlmacenada> {
  const subtotal = input.items.reduce((acc, i) => acc + i.cantidad * i.costoUnitario, 0);
  const montoImpuestos = input.pagoImpuestos ? input.montoImpuestos ?? 0 : 0;
  const costoTotal = subtotal + input.costoEnvioImportacion + input.otrosCostos + montoImpuestos;

  const [fila] = await db
    .insert(compras)
    .values({
      proveedor: input.proveedor,
      proveedorNombre: input.proveedorNombre,
      numeroOrdenExterno: input.numeroOrdenExterno,
      tipoEnvio: input.tipoEnvio,
      estado: "pedido",
      fechaCompra: new Date(input.fechaCompra),
      subtotal: subtotal.toFixed(2),
      costoEnvioImportacion: input.costoEnvioImportacion.toFixed(2),
      otrosCostos: input.otrosCostos.toFixed(2),
      pagoImpuestos: input.pagoImpuestos ?? false,
      montoImpuestos: input.pagoImpuestos ? montoImpuestos.toFixed(2) : null,
      costoTotal: costoTotal.toFixed(2),
      comprobanteUrl: input.comprobanteUrl,
      notas: input.notas,
      courierInternacional: input.courierInternacional,
      trackingInternacional: input.trackingInternacional,
    })
    .returning();

  if (input.items.length > 0) {
    await db.insert(compraItems).values(
      input.items.map((i) => ({
        compraId: fila.id,
        productoId: i.productoId,
        descripcion: i.descripcion,
        cantidad: i.cantidad,
        costoUnitario: i.costoUnitario.toFixed(2),
        categoriaId: i.categoriaId,
        marca: i.marca,
        precioVenta: i.precioVenta != null ? i.precioVenta.toFixed(2) : null,
        pesoKg: i.pesoKg != null ? i.pesoKg.toFixed(3) : null,
      })),
    );
  }

  return aCompraAlmacenada(fila);
}

function generarSku(descripcion: string) {
  const base = descripcion
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 16);
  const sufijo = Date.now().toString(36).toUpperCase().slice(-4);
  return `${base}-${sufijo}`;
}

export async function actualizarEstadoCompra(id: string, estado: EstadoCompra) {
  const [compraFila] = await db.select().from(compras).where(eq(compras.id, id)).limit(1);
  if (!compraFila) throw new Error("Compra no encontrada");

  const yaEstabaRecibida = compraFila.estado === "recibido";
  const cambios: Partial<typeof compras.$inferInsert> = { estado };

  if (estado === "en_almacen_usa" && !compraFila.fechaLlegadaAlmacen) {
    cambios.fechaLlegadaAlmacen = new Date();
  }

  if (estado === "recibido" && !yaEstabaRecibida) {
    cambios.fechaRecibido = new Date();

    const itemsFilas = await db.select().from(compraItems).where(eq(compraItems.compraId, id));
    const costoAdicionalTotal =
      Number(compraFila.costoEnvioImportacion) +
      Number(compraFila.otrosCostos) +
      (compraFila.pagoImpuestos ? Number(compraFila.montoImpuestos ?? 0) : 0);

    // Si TODOS los ítems traen peso, el envío/aduana se reparte proporcional
    // al peso real de cada uno (más justo: un celular no debería cargar lo
    // mismo que una laptop en el mismo paquete) — si falta el peso de
    // cualquier ítem, se cae al reparto en partes iguales por unidad, que
    // siempre es calculable.
    const pesoTotal = itemsFilas.reduce(
      (acc, i) => acc + (i.pesoKg != null ? Number(i.pesoKg) * i.cantidad : 0),
      0,
    );
    const repartoPorPeso = pesoTotal > 0 && itemsFilas.every((i) => i.pesoKg != null);

    const unidadesTotales = itemsFilas.reduce((acc, i) => acc + i.cantidad, 0) || 1;
    const costoAdicionalPorUnidad = costoAdicionalTotal / unidadesTotales;

    for (const item of itemsFilas) {
      const costoAdicionalItem = repartoPorPeso
        ? (costoAdicionalTotal * ((Number(item.pesoKg) * item.cantidad) / pesoTotal)) / item.cantidad
        : costoAdicionalPorUnidad;
      const costoFinal = Number(item.costoUnitario) + costoAdicionalItem;

      if (item.productoId) {
        // Producto ya existente en el catálogo: suma stock y recalcula costo.
        await registrarIngresoPorCompra(item.productoId, item.cantidad, costoFinal);
      } else if (item.categoriaId && item.precioVenta) {
        // Producto nuevo: recién ahora que "llegó a tu poder" se crea y se
        // PUBLICA en el catálogo (activo por defecto en adminCrearProducto).
        const nuevo = await adminCrearProducto({
          nombre: item.descripcion,
          descripcion: item.descripcion,
          precio: Number(item.precioVenta),
          precioOferta: null,
          costoAdquisicion: costoFinal,
          stock: item.cantidad,
          sku: generarSku(item.descripcion),
          marca: item.marca || "Sin marca",
          categoriaId: item.categoriaId,
          pesoKg: null,
          imagenes: [],
          specsJson: {},
          garantiaMeses: 0,
          destacado: false,
        });
        await db.update(compraItems).set({ productoId: nuevo.id }).where(eq(compraItems.id, item.id));
      }
    }
  }

  const [actualizada] = await db.update(compras).set(cambios).where(eq(compras.id, id)).returning();
  return aCompraAlmacenada(actualizada);
}

/** Para cargar el resultado de aduana una vez que ya se sabe (a veces se
 * conoce recién cuando el forwarder despacha, no al momento de comprar).
 * Si la compra ya estaba "recibida", esto NO recalcula retroactivamente el
 * costoAdquisicion ya aplicado a los productos — mismo criterio que el
 * resto del sistema, que usa el costo ACTUAL como aproximación y no lleva
 * un histórico perfecto por compra. */
export async function actualizarImpuestosCompra(
  id: string,
  input: { pagoImpuestos: boolean; montoImpuestos?: number },
): Promise<CompraAlmacenada> {
  const [compraFila] = await db.select().from(compras).where(eq(compras.id, id)).limit(1);
  if (!compraFila) throw new Error("Compra no encontrada");

  const montoImpuestos = input.pagoImpuestos ? input.montoImpuestos ?? 0 : 0;
  const costoTotal =
    Number(compraFila.subtotal) +
    Number(compraFila.costoEnvioImportacion) +
    Number(compraFila.otrosCostos) +
    montoImpuestos;

  const [actualizada] = await db
    .update(compras)
    .set({
      pagoImpuestos: input.pagoImpuestos,
      montoImpuestos: input.pagoImpuestos ? montoImpuestos.toFixed(2) : null,
      costoTotal: costoTotal.toFixed(2),
    })
    .where(eq(compras.id, id))
    .returning();
  return aCompraAlmacenada(actualizada);
}

/** Cuántas compras (no canceladas) sin pago de impuestos llevas en el año
 * — SUNAT solo permite un número limitado de envíos de entrega rápida sin
 * impuestos por persona al año (el admin puede ajustar el límite de
 * referencia en la UI; esto solo cuenta, no bloquea nada). */
export async function contarComprasDelAnioSinImpuestos(anio = new Date().getFullYear()) {
  const desde = new Date(anio, 0, 1);
  const hasta = new Date(anio + 1, 0, 1);
  const filas = await db
    .select({ id: compras.id })
    .from(compras)
    .where(
      and(
        ne(compras.estado, "cancelado"),
        eq(compras.pagoImpuestos, false),
        gte(compras.fechaCompra, desde),
        lt(compras.fechaCompra, hasta),
      ),
    );
  return filas.length;
}

export function nombreProveedor(compra: Pick<CompraAlmacenada, "proveedor" | "proveedorNombre">) {
  if (compra.proveedor === "amazon") return "Amazon";
  if (compra.proveedor === "ebay") return "eBay";
  return compra.proveedorNombre || "Otro";
}

export async function getResumenCompras() {
  const todas = await listarCompras();
  const activas = todas.filter((c) => c.estado !== "cancelado");
  const costoTotalCompras = activas.reduce((acc, c) => acc + c.costoTotal, 0);
  const comprasEnTransito = activas.filter(
    (c) => c.estado === "pedido" || c.estado === "en_transito" || c.estado === "aduana",
  ).length;
  return { costoTotalCompras, comprasEnTransito, totalCompras: activas.length };
}
