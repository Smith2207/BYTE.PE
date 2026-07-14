import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  compraItems,
  compras,
  pedidoItems,
  pedidos,
  solicitudesDevolucion,
  productos,
} from "@/db/schema";

export type MovimientoKardex = {
  fecha: string;
  tipo: "compra" | "venta" | "devolucion";
  documento: string;
  entrada: number;
  salida: number;
  saldo: number;
};

export type ProductoParaKardex = { id: string; nombre: string; sku: string };

/** Lista liviana para el selector de producto del Kardex. */
export async function listarProductosParaKardex(): Promise<ProductoParaKardex[]> {
  const filas = await db
    .select({ id: productos.id, nombre: productos.nombre, sku: productos.sku })
    .from(productos)
    .orderBy(productos.nombre);
  return filas.map((f) => ({ ...f, sku: f.sku ?? "—" }));
}

/**
 * Reconstruye el Kardex (entradas/salidas/saldo) de un producto a partir de
 * los movimientos que YA quedan registrados en el sistema — compras
 * recibidas, ventas y devoluciones completadas — sin necesitar una tabla de
 * movimientos aparte. El saldo se calcula desde 0 en orden cronológico; si
 * el producto tuvo un ajuste manual de stock (editado directo en la ficha),
 * el saldo calculado puede no coincidir con el stock actual — por eso se
 * devuelven ambos para que quede visible cualquier diferencia.
 */
export async function obtenerKardexProducto(productoId: string): Promise<{
  movimientos: MovimientoKardex[];
  stockActual: number;
  saldoCalculado: number;
}> {
  const [productoFila] = await db
    .select({ stock: productos.stock })
    .from(productos)
    .where(eq(productos.id, productoId))
    .limit(1);
  const stockActual = productoFila?.stock ?? 0;

  const entradasCompras = await db
    .select({
      fecha: compras.fechaRecibido,
      fechaCompra: compras.fechaCompra,
      documento: compras.numeroOrdenExterno,
      proveedorNombre: compras.proveedorNombre,
      cantidad: compraItems.cantidad,
    })
    .from(compraItems)
    .innerJoin(compras, eq(compraItems.compraId, compras.id))
    .where(eq(compraItems.productoId, productoId));

  const salidasVentas = await db
    .select({
      fecha: pedidos.createdAt,
      numeroPedido: pedidos.numeroPedido,
      cantidad: pedidoItems.cantidad,
    })
    .from(pedidoItems)
    .innerJoin(pedidos, eq(pedidoItems.pedidoId, pedidos.id))
    .where(eq(pedidoItems.productoId, productoId));

  const entradasDevoluciones = await db
    .select({
      fecha: solicitudesDevolucion.resueltoEn,
      numeroPedido: pedidos.numeroPedido,
      cantidad: pedidoItems.cantidad,
    })
    .from(solicitudesDevolucion)
    .innerJoin(pedidos, eq(solicitudesDevolucion.pedidoId, pedidos.id))
    .innerJoin(pedidoItems, eq(pedidoItems.pedidoId, pedidos.id))
    .where(
      and(eq(solicitudesDevolucion.estado, "completada"), eq(pedidoItems.productoId, productoId)),
    );

  type MovimientoSinSaldo = Omit<MovimientoKardex, "saldo"> & { fechaOrden: Date };

  const movimientosSinSaldo: MovimientoSinSaldo[] = [
    ...entradasCompras.map((c) => ({
      fechaOrden: c.fecha ?? c.fechaCompra,
      fecha: (c.fecha ?? c.fechaCompra).toISOString(),
      tipo: "compra" as const,
      documento: c.documento || c.proveedorNombre || "Compra",
      entrada: c.cantidad,
      salida: 0,
    })),
    ...salidasVentas.map((v) => ({
      fechaOrden: v.fecha,
      fecha: v.fecha.toISOString(),
      tipo: "venta" as const,
      documento: v.numeroPedido,
      entrada: 0,
      salida: v.cantidad,
    })),
    ...entradasDevoluciones
      .filter((d) => d.fecha != null)
      .map((d) => ({
        fechaOrden: d.fecha as Date,
        fecha: (d.fecha as Date).toISOString(),
        tipo: "devolucion" as const,
        documento: d.numeroPedido,
        entrada: d.cantidad,
        salida: 0,
      })),
  ].sort((a, b) => a.fechaOrden.getTime() - b.fechaOrden.getTime());

  let saldo = 0;
  const movimientos: MovimientoKardex[] = movimientosSinSaldo.map((m) => {
    saldo += m.entrada - m.salida;
    return { fecha: m.fecha, tipo: m.tipo, documento: m.documento, entrada: m.entrada, salida: m.salida, saldo };
  });

  return { movimientos, stockActual, saldoCalculado: saldo };
}
