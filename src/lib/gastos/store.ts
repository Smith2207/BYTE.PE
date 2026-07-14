import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { gastos } from "@/db/schema";
import type { CategoriaGasto } from "@/db/schema/enums";

export type GastoAlmacenado = {
  id: string;
  categoria: CategoriaGasto;
  descripcion: string;
  monto: number;
  fecha: string;
  comprobanteUrl: string | null;
  notas: string | null;
  createdAt: string;
};

function aGastoAlmacenado(g: typeof gastos.$inferSelect): GastoAlmacenado {
  return {
    id: g.id,
    categoria: g.categoria,
    descripcion: g.descripcion,
    monto: Number(g.monto),
    fecha: g.fecha.toISOString(),
    comprobanteUrl: g.comprobanteUrl,
    notas: g.notas,
    createdAt: g.createdAt.toISOString(),
  };
}

export type GastoFormInput = {
  categoria: CategoriaGasto;
  descripcion: string;
  monto: number;
  fecha: Date;
  comprobanteUrl?: string | null;
  notas?: string | null;
};

export async function crearGasto(input: GastoFormInput): Promise<GastoAlmacenado> {
  const [fila] = await db
    .insert(gastos)
    .values({
      categoria: input.categoria,
      descripcion: input.descripcion,
      monto: input.monto.toFixed(2),
      fecha: input.fecha,
      comprobanteUrl: input.comprobanteUrl || null,
      notas: input.notas || null,
    })
    .returning();
  return aGastoAlmacenado(fila);
}

export async function actualizarGasto(
  id: string,
  input: Partial<GastoFormInput>,
): Promise<GastoAlmacenado> {
  const cambios: Partial<typeof gastos.$inferInsert> = {};
  if (input.categoria !== undefined) cambios.categoria = input.categoria;
  if (input.descripcion !== undefined) cambios.descripcion = input.descripcion;
  if (input.monto !== undefined) cambios.monto = input.monto.toFixed(2);
  if (input.fecha !== undefined) cambios.fecha = input.fecha;
  if (input.comprobanteUrl !== undefined) cambios.comprobanteUrl = input.comprobanteUrl || null;
  if (input.notas !== undefined) cambios.notas = input.notas || null;

  const [fila] = await db.update(gastos).set(cambios).where(eq(gastos.id, id)).returning();
  if (!fila) throw new Error("Gasto no encontrado");
  return aGastoAlmacenado(fila);
}

export async function eliminarGasto(id: string) {
  await db.delete(gastos).where(eq(gastos.id, id));
}

export async function listarGastos(): Promise<GastoAlmacenado[]> {
  const filas = await db.select().from(gastos).orderBy(desc(gastos.fecha));
  return filas.map(aGastoAlmacenado);
}
