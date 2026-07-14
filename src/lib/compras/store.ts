import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { compras, compraItems } from "@/db/schema";
import { registrarIngresoPorCompra, adminCrearProducto } from "@/lib/mock/repo";
import type { ProveedorCompra as ProveedorCompraEnum, EstadoCompra } from "@/db/schema/enums";

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
};

export type CompraAlmacenada = {
  id: string;
  proveedor: ProveedorCompra;
  proveedorNombre?: string;
  numeroOrdenExterno?: string;
  estado: EstadoCompra;
  fechaCompra: string;
  fechaRecibido?: string;
  items: CompraItemAlmacenado[];
  subtotal: number;
  costoEnvioImportacion: number;
  otrosCostos: number;
  costoTotal: number;
  comprobanteUrl?: string;
  notas?: string;
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
  };
}

async function aCompraAlmacenada(c: typeof compras.$inferSelect): Promise<CompraAlmacenada> {
  const itemsFilas = await db.select().from(compraItems).where(eq(compraItems.compraId, c.id));
  return {
    id: c.id,
    proveedor: c.proveedor,
    proveedorNombre: c.proveedorNombre ?? undefined,
    numeroOrdenExterno: c.numeroOrdenExterno ?? undefined,
    estado: c.estado,
    fechaCompra: c.fechaCompra.toISOString(),
    fechaRecibido: c.fechaRecibido?.toISOString(),
    items: itemsFilas.map(aCompraItemAlmacenado),
    subtotal: Number(c.subtotal),
    costoEnvioImportacion: Number(c.costoEnvioImportacion),
    otrosCostos: Number(c.otrosCostos),
    costoTotal: Number(c.costoTotal),
    comprobanteUrl: c.comprobanteUrl ?? undefined,
    notas: c.notas ?? undefined,
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
  fechaCompra: string;
  items: CompraItemAlmacenado[];
  costoEnvioImportacion: number;
  otrosCostos: number;
  comprobanteUrl?: string;
  notas?: string;
};

export async function crearCompra(input: CompraFormInput): Promise<CompraAlmacenada> {
  const subtotal = input.items.reduce((acc, i) => acc + i.cantidad * i.costoUnitario, 0);
  const costoTotal = subtotal + input.costoEnvioImportacion + input.otrosCostos;

  const [fila] = await db
    .insert(compras)
    .values({
      proveedor: input.proveedor,
      proveedorNombre: input.proveedorNombre,
      numeroOrdenExterno: input.numeroOrdenExterno,
      estado: "pedido",
      fechaCompra: new Date(input.fechaCompra),
      subtotal: subtotal.toFixed(2),
      costoEnvioImportacion: input.costoEnvioImportacion.toFixed(2),
      otrosCostos: input.otrosCostos.toFixed(2),
      costoTotal: costoTotal.toFixed(2),
      comprobanteUrl: input.comprobanteUrl,
      notas: input.notas,
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

  if (estado === "recibido" && !yaEstabaRecibida) {
    cambios.fechaRecibido = new Date();

    const itemsFilas = await db.select().from(compraItems).where(eq(compraItems.compraId, id));
    const unidadesTotales = itemsFilas.reduce((acc, i) => acc + i.cantidad, 0) || 1;
    const costoAdicionalPorUnidad =
      (Number(compraFila.costoEnvioImportacion) + Number(compraFila.otrosCostos)) / unidadesTotales;

    for (const item of itemsFilas) {
      const costoFinal = Number(item.costoUnitario) + costoAdicionalPorUnidad;

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
