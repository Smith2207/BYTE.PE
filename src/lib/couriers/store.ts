import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { couriers, tarifasCourier } from "@/db/schema";

const DEPARTAMENTO_FALLBACK = "Otros";

export type CourierAlmacenado = {
  id: string;
  nombre: string;
  trackingUrlPattern: string | null;
  activo: boolean;
  createdAt: string;
};

export type TarifaCourierAlmacenada = {
  id: string;
  courierId: string;
  departamento: string;
  costo: number;
  diasEstimadosMin: number;
  diasEstimadosMax: number;
};

function aCourierAlmacenado(c: typeof couriers.$inferSelect): CourierAlmacenado {
  return {
    id: c.id,
    nombre: c.nombre,
    trackingUrlPattern: c.trackingUrlPattern,
    activo: c.activo,
    createdAt: c.createdAt.toISOString(),
  };
}

function aTarifaAlmacenada(t: typeof tarifasCourier.$inferSelect): TarifaCourierAlmacenada {
  return {
    id: t.id,
    courierId: t.courierId,
    departamento: t.departamento,
    costo: Number(t.costo),
    diasEstimadosMin: t.diasEstimadosMin,
    diasEstimadosMax: t.diasEstimadosMax,
  };
}

export async function listarCouriers(): Promise<CourierAlmacenado[]> {
  const filas = await db.select().from(couriers).orderBy(asc(couriers.nombre));
  return filas.map(aCourierAlmacenado);
}

export async function crearCourier(input: {
  nombre: string;
  trackingUrlPattern?: string | null;
}): Promise<CourierAlmacenado> {
  const [fila] = await db
    .insert(couriers)
    .values({ nombre: input.nombre, trackingUrlPattern: input.trackingUrlPattern || null })
    .returning();
  return aCourierAlmacenado(fila);
}

export async function actualizarCourier(
  id: string,
  input: Partial<{ nombre: string; trackingUrlPattern: string | null; activo: boolean }>,
): Promise<CourierAlmacenado> {
  const [fila] = await db.update(couriers).set(input).where(eq(couriers.id, id)).returning();
  if (!fila) throw new Error("Courier no encontrado");
  return aCourierAlmacenado(fila);
}

export async function eliminarCourier(id: string) {
  await db.delete(couriers).where(eq(couriers.id, id));
}

export async function listarTarifasCourier(courierId: string): Promise<TarifaCourierAlmacenada[]> {
  const filas = await db
    .select()
    .from(tarifasCourier)
    .where(eq(tarifasCourier.courierId, courierId))
    .orderBy(asc(tarifasCourier.departamento));
  return filas.map(aTarifaAlmacenada);
}

export async function crearTarifaCourier(input: {
  courierId: string;
  departamento: string;
  costo: number;
  diasEstimadosMin: number;
  diasEstimadosMax: number;
}): Promise<TarifaCourierAlmacenada> {
  const [fila] = await db
    .insert(tarifasCourier)
    .values({
      courierId: input.courierId,
      departamento: input.departamento,
      costo: input.costo.toFixed(2),
      diasEstimadosMin: input.diasEstimadosMin,
      diasEstimadosMax: input.diasEstimadosMax,
    })
    .returning();
  return aTarifaAlmacenada(fila);
}

export async function eliminarTarifaCourier(id: string) {
  await db.delete(tarifasCourier).where(eq(tarifasCourier.id, id));
}

export type OpcionCourierCheckout = {
  courierId: string;
  nombre: string;
  costo: number;
  diasEstimadosMin: number;
  diasEstimadosMax: number;
};

/** Couriers activos con tarifa para el departamento del cliente (o el
 * fallback "Otros" si ese courier no cargó una tarifa específica) — para
 * que el cliente elija compañía en el checkout. */
export async function getCouriersConTarifaPorDepartamento(
  departamento: string,
): Promise<OpcionCourierCheckout[]> {
  const filas = await db
    .select({
      courierId: couriers.id,
      nombre: couriers.nombre,
      departamento: tarifasCourier.departamento,
      costo: tarifasCourier.costo,
      diasEstimadosMin: tarifasCourier.diasEstimadosMin,
      diasEstimadosMax: tarifasCourier.diasEstimadosMax,
    })
    .from(couriers)
    .innerJoin(tarifasCourier, eq(tarifasCourier.courierId, couriers.id))
    .where(and(eq(couriers.activo, true)))
    .orderBy(asc(couriers.nombre));

  const porCourier = new Map<string, (typeof filas)[number][]>();
  for (const fila of filas) {
    const lista = porCourier.get(fila.courierId) ?? [];
    lista.push(fila);
    porCourier.set(fila.courierId, lista);
  }

  const opciones: OpcionCourierCheckout[] = [];
  for (const [courierId, tarifasDelCourier] of Array.from(porCourier.entries())) {
    const tarifa =
      tarifasDelCourier.find((t) => t.departamento === departamento) ??
      tarifasDelCourier.find((t) => t.departamento === DEPARTAMENTO_FALLBACK);
    if (!tarifa) continue;
    opciones.push({
      courierId,
      nombre: tarifa.nombre,
      costo: Number(tarifa.costo),
      diasEstimadosMin: tarifa.diasEstimadosMin,
      diasEstimadosMax: tarifa.diasEstimadosMax,
    });
  }
  return opciones;
}

/** Recalcula server-side la tarifa del courier elegido — nunca se confía en
 * un costo mandado por el cliente. Devuelve `null` si el courier no está
 * activo o no tiene tarifa (ni siquiera de fallback) para ese departamento. */
export async function getTarifaCourierParaCheckout(
  courierId: string,
  departamento: string,
): Promise<{ nombre: string; costo: number } | null> {
  const [courier] = await db
    .select({ id: couriers.id, nombre: couriers.nombre, activo: couriers.activo })
    .from(couriers)
    .where(eq(couriers.id, courierId))
    .limit(1);
  if (!courier || !courier.activo) return null;

  const tarifasDelCourier = await db
    .select({ departamento: tarifasCourier.departamento, costo: tarifasCourier.costo })
    .from(tarifasCourier)
    .where(eq(tarifasCourier.courierId, courierId));

  const tarifa =
    tarifasDelCourier.find((t) => t.departamento === departamento) ??
    tarifasDelCourier.find((t) => t.departamento === DEPARTAMENTO_FALLBACK);
  if (!tarifa) return null;

  return { nombre: courier.nombre, costo: Number(tarifa.costo) };
}
