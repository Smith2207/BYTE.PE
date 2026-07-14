import { desc, eq, sql } from "drizzle-orm";
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
  numeroPedido: string;
  usuarioId?: string;
  estado: "pendiente" | "pagado" | "preparando" | "enviado" | "entregado" | "cancelado";
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

type GuardarPedidoInput = Omit<PedidoMock, "estado" | "courier" | "numeroTracking"> & {
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
