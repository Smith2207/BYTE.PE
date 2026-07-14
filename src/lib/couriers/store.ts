import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { couriers, tarifasCourier } from "@/db/schema";

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
