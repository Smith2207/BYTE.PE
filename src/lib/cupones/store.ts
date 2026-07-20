import { and, eq, gte, ilike, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { cupones } from "@/db/schema";
import type { CuponSeed } from "@/data/catalogo-seed";

export type CuponAlmacenado = CuponSeed & { id: string; activo: boolean; usosActuales: number };

function aCuponAlmacenado(c: typeof cupones.$inferSelect): CuponAlmacenado {
  return {
    id: c.id,
    codigo: c.codigo,
    tipo: c.tipo,
    valor: Number(c.valor),
    montoMinimoCompra: Number(c.montoMinimoCompra),
    fechaInicio: c.fechaInicio.toISOString(),
    fechaFin: c.fechaFin.toISOString(),
    usosMaximos: c.usosMaximos,
    usosActuales: c.usosActuales,
    activo: c.activo,
  };
}

export async function getCuponPorCodigo(codigo: string): Promise<CuponAlmacenado | undefined> {
  const [fila] = await db
    .select()
    .from(cupones)
    .where(ilike(cupones.codigo, codigo.trim()))
    .limit(1);
  return fila?.activo ? aCuponAlmacenado(fila) : undefined;
}

/** El cupón vigente con mayor valor, para mostrarlo en el banner del home. */
export async function getCuponDestacado(): Promise<CuponAlmacenado | undefined> {
  const ahora = new Date();
  const [fila] = await db
    .select()
    .from(cupones)
    .where(and(eq(cupones.activo, true), lte(cupones.fechaInicio, ahora), gte(cupones.fechaFin, ahora)))
    .orderBy(sql`${cupones.valor}::numeric desc`)
    .limit(1);
  return fila ? aCuponAlmacenado(fila) : undefined;
}

export async function incrementarUso(codigo: string, ejecutor: Pick<typeof db, "update"> = db) {
  await ejecutor
    .update(cupones)
    .set({ usosActuales: sql`${cupones.usosActuales} + 1` })
    .where(ilike(cupones.codigo, codigo.trim()));
}

// ---------- Administración ----------

export async function adminListarCupones(): Promise<CuponAlmacenado[]> {
  const filas = await db.select().from(cupones);
  return filas.map(aCuponAlmacenado);
}

export type CuponFormInput = Omit<CuponSeed, "codigo"> & { codigo: string };

/** Nunca confiar solo en la validación del navegador — un cupón de
 * "500% de descuento" por un typo dejaría precios negativos en checkout. */
function validarCuponInput(input: Partial<CuponFormInput>) {
  if (input.tipo === "porcentaje" && input.valor != null && input.valor > 100) {
    throw new Error("Un descuento por porcentaje no puede ser mayor a 100%.");
  }
  if (input.fechaInicio && input.fechaFin && input.fechaFin < input.fechaInicio) {
    throw new Error('"Vigente hasta" no puede ser antes que "Vigente desde".');
  }
}

export async function adminCrearCupon(input: CuponFormInput): Promise<CuponAlmacenado> {
  validarCuponInput(input);
  const existente = await getCuponPorCodigo(input.codigo);
  if (existente) throw new Error("Ya existe un cupón con ese código.");

  const [fila] = await db
    .insert(cupones)
    .values({
      codigo: input.codigo.toUpperCase(),
      tipo: input.tipo,
      valor: input.valor.toFixed(2),
      montoMinimoCompra: input.montoMinimoCompra.toFixed(2),
      fechaInicio: new Date(input.fechaInicio),
      fechaFin: new Date(input.fechaFin),
      usosMaximos: input.usosMaximos,
    })
    .returning();
  return aCuponAlmacenado(fila);
}

export async function adminActualizarCupon(
  id: string,
  input: Partial<CuponFormInput & { activo: boolean }>,
): Promise<CuponAlmacenado> {
  validarCuponInput(input);
  const cambios: Partial<typeof cupones.$inferInsert> = {};
  if (input.codigo !== undefined) cambios.codigo = input.codigo.toUpperCase();
  if (input.tipo !== undefined) cambios.tipo = input.tipo;
  if (input.valor !== undefined) cambios.valor = input.valor.toFixed(2);
  if (input.montoMinimoCompra !== undefined)
    cambios.montoMinimoCompra = input.montoMinimoCompra.toFixed(2);
  if (input.fechaInicio !== undefined) cambios.fechaInicio = new Date(input.fechaInicio);
  if (input.fechaFin !== undefined) cambios.fechaFin = new Date(input.fechaFin);
  if (input.usosMaximos !== undefined) cambios.usosMaximos = input.usosMaximos;
  if (input.activo !== undefined) cambios.activo = input.activo;

  const [fila] = await db.update(cupones).set(cambios).where(eq(cupones.id, id)).returning();
  if (!fila) throw new Error("Cupón no encontrado");
  return aCuponAlmacenado(fila);
}

export async function adminEliminarCupon(id: string) {
  await db.delete(cupones).where(eq(cupones.id, id));
}
