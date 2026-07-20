import { and, eq, inArray, isNotNull, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { carritoItems, carritos, productos, usuarios } from "@/db/schema";

export type CarritoItemInput = {
  productoId: string;
  varianteId: string | null;
  cantidad: number;
};

export type CarritoAbandonado = {
  carritoId: string;
  email: string;
  nombre: string;
  items: { nombre: string; cantidad: number; precioUnitario: number }[];
};

export async function obtenerOCrearCarrito(input: {
  usuarioId?: string;
  sessionId?: string;
}): Promise<string> {
  if (!input.usuarioId && !input.sessionId) {
    throw new Error("obtenerOCrearCarrito requiere usuarioId o sessionId");
  }
  const condicion = input.usuarioId
    ? eq(carritos.usuarioId, input.usuarioId)
    : eq(carritos.sessionId, input.sessionId!);

  const [existente] = await db.select({ id: carritos.id }).from(carritos).where(condicion).limit(1);
  if (existente) return existente.id;

  const [nuevo] = await db
    .insert(carritos)
    .values({
      usuarioId: input.usuarioId,
      sessionId: input.usuarioId ? null : input.sessionId,
    })
    .returning({ id: carritos.id });
  return nuevo.id;
}

/** Reemplaza el listado completo de items — el carrito local es la fuente
 * de verdad, sincronizamos el snapshot completo en cada cambio. */
export async function reemplazarItemsCarrito(carritoId: string, items: CarritoItemInput[]): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(carritoItems).where(eq(carritoItems.carritoId, carritoId));
    if (items.length > 0) {
      await tx.insert(carritoItems).values(
        items.map((item) => ({
          carritoId,
          productoId: item.productoId,
          varianteId: item.varianteId,
          cantidad: item.cantidad,
        })),
      );
    }
    // Actividad real: reinicia el reloj de "abandonado" y el flag de aviso.
    await tx
      .update(carritos)
      .set({ updatedAt: new Date(), recordatorioEnviado: false })
      .where(eq(carritos.id, carritoId));
  });
}

export async function cerrarCarritoPorUsuario(usuarioId: string): Promise<void> {
  await db.delete(carritos).where(eq(carritos.usuarioId, usuarioId));
}

export async function cerrarCarritoPorSession(sessionId: string): Promise<void> {
  await db.delete(carritos).where(eq(carritos.sessionId, sessionId));
}

/** Al loguearse un invitado con carrito propio: fusiona cantidades (cap a
 * stock) si el usuario ya tenía carrito, o simplemente reasigna el dueño. */
export async function fusionarCarritoInvitadoConUsuario(sessionId: string, usuarioId: string): Promise<void> {
  const [carritoInvitado] = await db
    .select({ id: carritos.id })
    .from(carritos)
    .where(eq(carritos.sessionId, sessionId))
    .limit(1);
  if (!carritoInvitado) return;

  const [carritoUsuario] = await db
    .select({ id: carritos.id })
    .from(carritos)
    .where(eq(carritos.usuarioId, usuarioId))
    .limit(1);

  if (!carritoUsuario) {
    await db
      .update(carritos)
      .set({ usuarioId, sessionId: null, updatedAt: new Date() })
      .where(eq(carritos.id, carritoInvitado.id));
    return;
  }

  const [itemsInvitado, itemsUsuario] = await Promise.all([
    db.select().from(carritoItems).where(eq(carritoItems.carritoId, carritoInvitado.id)),
    db.select().from(carritoItems).where(eq(carritoItems.carritoId, carritoUsuario.id)),
  ]);

  const claveDe = (i: { productoId: string; varianteId: string | null }) =>
    `${i.productoId}:${i.varianteId ?? ""}`;
  const combinados = new Map<string, CarritoItemInput>();
  for (const item of [...itemsUsuario, ...itemsInvitado]) {
    const clave = claveDe(item);
    const previo = combinados.get(clave);
    combinados.set(clave, {
      productoId: item.productoId,
      varianteId: item.varianteId,
      cantidad: (previo?.cantidad ?? 0) + item.cantidad,
    });
  }

  const itemsCombinados = Array.from(combinados.values());
  const productoIds = Array.from(new Set(itemsCombinados.map((i) => i.productoId)));
  const stocks = productoIds.length
    ? await db
        .select({ id: productos.id, stock: productos.stock })
        .from(productos)
        .where(inArray(productos.id, productoIds))
    : [];
  const stockPorProducto = new Map(stocks.map((p) => [p.id, p.stock]));

  const itemsFinales = itemsCombinados.map((item) => {
    const stockMax = stockPorProducto.get(item.productoId);
    return stockMax != null
      ? { ...item, cantidad: Math.min(item.cantidad, Math.max(stockMax, 1)) }
      : item;
  });

  await db.transaction(async (tx) => {
    await tx.delete(carritoItems).where(eq(carritoItems.carritoId, carritoUsuario.id));
    if (itemsFinales.length > 0) {
      await tx
        .insert(carritoItems)
        .values(itemsFinales.map((item) => ({ carritoId: carritoUsuario.id, ...item })));
    }
    await tx
      .update(carritos)
      .set({ updatedAt: new Date(), recordatorioEnviado: false })
      .where(eq(carritos.id, carritoUsuario.id));
    await tx.delete(carritos).where(eq(carritos.id, carritoInvitado.id));
  });
}

/** Carritos de usuarios logueados sin actividad reciente, con items, que
 * todavía no recibieron el recordatorio. Los carritos de invitado quedan
 * fuera: no hay email disponible para ellos hasta que inicien sesión. */
export async function listarCarritosAbandonados(horasInactividad: number): Promise<CarritoAbandonado[]> {
  const limite = sql`now() - (interval '1 hour' * ${horasInactividad})`;

  const candidatos = await db
    .select({ carritoId: carritos.id, email: usuarios.email, nombre: usuarios.nombre })
    .from(carritos)
    .innerJoin(usuarios, eq(carritos.usuarioId, usuarios.id))
    .where(
      and(
        isNotNull(carritos.usuarioId),
        lt(carritos.updatedAt, limite),
        eq(carritos.recordatorioEnviado, false),
      ),
    );
  if (candidatos.length === 0) return [];

  const carritoIds = candidatos.map((c) => c.carritoId);
  const filasItems = await db
    .select({
      carritoId: carritoItems.carritoId,
      nombre: productos.nombre,
      cantidad: carritoItems.cantidad,
      precio: productos.precio,
      precioOferta: productos.precioOferta,
    })
    .from(carritoItems)
    .innerJoin(productos, eq(carritoItems.productoId, productos.id))
    .where(inArray(carritoItems.carritoId, carritoIds));

  const itemsPorCarrito = new Map<string, CarritoAbandonado["items"]>();
  for (const fila of filasItems) {
    const lista = itemsPorCarrito.get(fila.carritoId) ?? [];
    lista.push({
      nombre: fila.nombre,
      cantidad: fila.cantidad,
      precioUnitario: Number(fila.precioOferta ?? fila.precio),
    });
    itemsPorCarrito.set(fila.carritoId, lista);
  }

  return candidatos
    .map((c) => ({ ...c, items: itemsPorCarrito.get(c.carritoId) ?? [] }))
    .filter((c) => c.items.length > 0);
}

export async function marcarRecordatorioEnviado(carritoId: string): Promise<void> {
  await db.update(carritos).set({ recordatorioEnviado: true }).where(eq(carritos.id, carritoId));
}
