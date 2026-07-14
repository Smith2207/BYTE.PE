import { and, desc, eq, gte, lt, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { pedidos, pedidoItems, direcciones, cupones } from "@/db/schema";
import type { TipoDocumento, MetodoPago } from "@/db/schema/enums";

export type PedidoItemMock = {
  productoId: string;
  varianteId: string | null;
  nombreProducto: string;
  varianteLabel?: string;
  cantidad: number;
  precioUnitario: number;
};

export type PedidoMock = {
  id: string;
  numeroPedido: string;
  usuarioId?: string;
  estado:
    | "pendiente"
    | "pagado"
    | "preparando"
    | "enviado"
    | "entregado"
    | "cancelado"
    | "reembolsado";
  items: PedidoItemMock[];
  subtotal: number;
  igv: number;
  descuento: number;
  costoEnvio: number;
  total: number;
  cuponCodigo?: string;
  direccion: {
    departamento: string;
    provincia: string;
    distrito: string;
    direccionExacta?: string;
    referencia?: string;
  };
  tipoDocumento: TipoDocumento;
  docComprador: string;
  nombreComprador: string;
  telefonoComprador: string;
  emailComprador: string;
  requiereFactura: boolean;
  ruc?: string;
  razonSocial?: string;
  metodoPago: string;
  courier?: string;
  numeroTracking?: string;
  createdAt: string;
};

type Ejecutor = Pick<typeof db, "select" | "insert" | "update">;

export async function generarNumeroPedido(tx: Ejecutor = db) {
  const [{ total }] = await tx.select({ total: sql<number>`count(*)::int` }).from(pedidos);
  const correlativo = (total + 1).toString().padStart(6, "0");
  return `ORD-${new Date().getFullYear()}${correlativo}`;
}

type GuardarPedidoInput = Omit<PedidoMock, "id" | "estado" | "courier" | "numeroTracking"> & {
  estado?: PedidoMock["estado"];
};

export async function guardarPedido(pedido: GuardarPedidoInput, tx: Ejecutor = db) {
  const [direccionFila] = await tx
    .insert(direcciones)
    .values({
      usuarioId: pedido.usuarioId ?? null,
      departamento: pedido.direccion.departamento,
      provincia: pedido.direccion.provincia,
      distrito: pedido.direccion.distrito,
      direccionExacta: pedido.direccion.direccionExacta,
      referencia: pedido.direccion.referencia,
      esPrincipal: false,
    })
    .returning({ id: direcciones.id });

  let cuponId: string | null = null;
  if (pedido.cuponCodigo) {
    const [cupon] = await tx
      .select({ id: cupones.id })
      .from(cupones)
      .where(eq(cupones.codigo, pedido.cuponCodigo))
      .limit(1);
    cuponId = cupon?.id ?? null;
  }

  const [pedidoFila] = await tx
    .insert(pedidos)
    .values({
      usuarioId: pedido.usuarioId ?? null,
      numeroPedido: pedido.numeroPedido,
      estado: pedido.estado ?? "pendiente",
      subtotal: pedido.subtotal.toFixed(2),
      igv: pedido.igv.toFixed(2),
      descuento: pedido.descuento.toFixed(2),
      costoEnvio: pedido.costoEnvio.toFixed(2),
      total: pedido.total.toFixed(2),
      cuponId,
      direccionEnvioId: direccionFila.id,
      tipoDocumento: pedido.tipoDocumento,
      docComprador: pedido.docComprador,
      nombreComprador: pedido.nombreComprador,
      telefonoComprador: pedido.telefonoComprador,
      emailComprador: pedido.emailComprador,
      requiereFactura: pedido.requiereFactura,
      ruc: pedido.ruc,
      razonSocial: pedido.razonSocial,
      metodoPago: pedido.metodoPago as MetodoPago,
    })
    .returning({ id: pedidos.id });

  if (pedido.items.length > 0) {
    await tx.insert(pedidoItems).values(
      pedido.items.map((item) => ({
        pedidoId: pedidoFila.id,
        productoId: item.productoId,
        varianteId: item.varianteId,
        nombreProducto: item.nombreProducto,
        varianteLabel: item.varianteLabel,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario.toFixed(2),
      })),
    );
  }
}

async function aPedidoMock(
  fila: typeof pedidos.$inferSelect,
  tx: Ejecutor,
): Promise<PedidoMock> {
  const [itemsFilas, direccionFila, cuponFila] = await Promise.all([
    tx.select().from(pedidoItems).where(eq(pedidoItems.pedidoId, fila.id)),
    fila.direccionEnvioId
      ? tx.select().from(direcciones).where(eq(direcciones.id, fila.direccionEnvioId)).limit(1)
      : Promise.resolve([]),
    fila.cuponId
      ? tx.select({ codigo: cupones.codigo }).from(cupones).where(eq(cupones.id, fila.cuponId)).limit(1)
      : Promise.resolve([]),
  ]);
  const direccionFilaUnica = direccionFila[0];

  return {
    id: fila.id,
    numeroPedido: fila.numeroPedido,
    usuarioId: fila.usuarioId ?? undefined,
    estado: fila.estado as PedidoMock["estado"],
    items: itemsFilas.map((i) => ({
      productoId: i.productoId ?? "",
      varianteId: i.varianteId,
      nombreProducto: i.nombreProducto,
      varianteLabel: i.varianteLabel ?? undefined,
      cantidad: i.cantidad,
      precioUnitario: Number(i.precioUnitario),
    })),
    subtotal: Number(fila.subtotal),
    igv: Number(fila.igv),
    descuento: Number(fila.descuento),
    costoEnvio: Number(fila.costoEnvio),
    total: Number(fila.total),
    cuponCodigo: cuponFila[0]?.codigo,
    direccion: {
      departamento: direccionFilaUnica?.departamento ?? "",
      provincia: direccionFilaUnica?.provincia ?? "",
      distrito: direccionFilaUnica?.distrito ?? "",
      direccionExacta: direccionFilaUnica?.direccionExacta ?? undefined,
      referencia: direccionFilaUnica?.referencia ?? undefined,
    },
    tipoDocumento: fila.tipoDocumento,
    docComprador: fila.docComprador,
    nombreComprador: fila.nombreComprador,
    telefonoComprador: fila.telefonoComprador,
    emailComprador: fila.emailComprador,
    requiereFactura: fila.requiereFactura,
    ruc: fila.ruc ?? undefined,
    razonSocial: fila.razonSocial ?? undefined,
    metodoPago: fila.metodoPago ?? "",
    courier: fila.courier ?? undefined,
    numeroTracking: fila.numeroTracking ?? undefined,
    createdAt: fila.createdAt.toISOString(),
  };
}

export async function getPedido(numeroPedido: string): Promise<PedidoMock | null> {
  const [fila] = await db.select().from(pedidos).where(eq(pedidos.numeroPedido, numeroPedido)).limit(1);
  return fila ? aPedidoMock(fila, db) : null;
}

export async function listarPedidos(): Promise<PedidoMock[]> {
  const filas = await db.select().from(pedidos).orderBy(desc(pedidos.createdAt));
  return Promise.all(filas.map((f) => aPedidoMock(f, db)));
}

export async function listarPedidosPorUsuario(usuarioId: string): Promise<PedidoMock[]> {
  const filas = await db
    .select()
    .from(pedidos)
    .where(eq(pedidos.usuarioId, usuarioId))
    .orderBy(desc(pedidos.createdAt));
  return Promise.all(filas.map((f) => aPedidoMock(f, db)));
}

/** Solo el conteo, para la campana de notificaciones del admin — evita
 * traer la lista completa de pedidos en cada navegación. */
export async function contarPedidosPendientes() {
  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(pedidos)
    .where(eq(pedidos.estado, "pendiente"));
  return total;
}

/** IDs de producto ordenados por unidades vendidas (para el badge "Más
 * vendido" en la tienda y el gráfico del dashboard admin). */
export async function getProductoIdsMasVendidos(limit = 4): Promise<string[]> {
  const filas = await db
    .select({
      productoId: pedidoItems.productoId,
      unidades: sql<number>`sum(${pedidoItems.cantidad})::int`,
    })
    .from(pedidoItems)
    .innerJoin(pedidos, eq(pedidoItems.pedidoId, pedidos.id))
    .where(ne(pedidos.estado, "cancelado"))
    .groupBy(pedidoItems.productoId)
    .orderBy(desc(sql`sum(${pedidoItems.cantidad})`))
    .limit(limit);
  return filas.map((f) => f.productoId).filter((id): id is string => id != null);
}

/** Variación % de ventas y de cantidad de pedidos: últimos 30 días vs. los
 * 30 días previos a esos (ventana móvil, no mes calendario — comparar un mes
 * en curso contra un mes calendario completo sería engañoso a inicios de mes).
 * Devuelve `null` por métrica si el periodo anterior no tiene datos (evita
 * un "+∞%" sin sentido). */
export async function getVariacionUltimos30Dias(): Promise<{
  ventas: number | null;
  pedidos: number | null;
}> {
  const ahora = new Date();
  const hace30 = new Date(ahora);
  hace30.setDate(hace30.getDate() - 30);
  const hace60 = new Date(ahora);
  hace60.setDate(hace60.getDate() - 60);

  const [actual] = await db
    .select({
      ventas: sql<number>`coalesce(sum(${pedidos.total}::numeric), 0)::float`,
      pedidos: sql<number>`count(*)::int`,
    })
    .from(pedidos)
    .where(and(ne(pedidos.estado, "cancelado"), gte(pedidos.createdAt, hace30)));

  const [anterior] = await db
    .select({
      ventas: sql<number>`coalesce(sum(${pedidos.total}::numeric), 0)::float`,
      pedidos: sql<number>`count(*)::int`,
    })
    .from(pedidos)
    .where(
      and(
        ne(pedidos.estado, "cancelado"),
        gte(pedidos.createdAt, hace60),
        lt(pedidos.createdAt, hace30),
      ),
    );

  const variacion = (actualValor: number, anteriorValor: number) =>
    anteriorValor === 0 ? null : Math.round(((actualValor - anteriorValor) / anteriorValor) * 100);

  return {
    ventas: variacion(actual.ventas, anterior.ventas),
    pedidos: variacion(actual.pedidos, anterior.pedidos),
  };
}

export async function actualizarEstadoPedido(
  numeroPedido: string,
  estado: PedidoMock["estado"],
  datos?: { courier?: string; numeroTracking?: string },
) {
  const cambios: Partial<typeof pedidos.$inferInsert> = { estado, updatedAt: new Date() };
  if (datos?.courier !== undefined) cambios.courier = datos.courier;
  if (datos?.numeroTracking !== undefined) cambios.numeroTracking = datos.numeroTracking;

  const [fila] = await db
    .update(pedidos)
    .set(cambios)
    .where(eq(pedidos.numeroPedido, numeroPedido))
    .returning();
  if (!fila) throw new Error("Pedido no encontrado");
  return aPedidoMock(fila, db);
}
