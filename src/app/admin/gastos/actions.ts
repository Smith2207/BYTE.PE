"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { crearGasto, actualizarGasto, eliminarGasto, type GastoFormInput } from "@/lib/gastos/store";

const gastoSchema = z.object({
  categoria: z.enum(["alquiler", "marketing", "sueldos", "servicios", "otros"]),
  descripcion: z.string().min(2, "Describe brevemente el gasto"),
  monto: z.number().positive("Ingresa un monto válido"),
  fecha: z.string().min(1, "Selecciona una fecha"),
  comprobanteUrl: z.string().optional(),
  notas: z.string().optional(),
});

type GastoInput = z.infer<typeof gastoSchema>;

function aFormInput(datos: GastoInput): GastoFormInput {
  return {
    categoria: datos.categoria,
    descripcion: datos.descripcion,
    monto: datos.monto,
    fecha: new Date(datos.fecha),
    comprobanteUrl: datos.comprobanteUrl,
    notas: datos.notas,
  };
}

export async function crearGastoAction(input: GastoInput) {
  const datos = gastoSchema.parse(input);
  const gasto = await crearGasto(aFormInput(datos));
  revalidatePath("/admin/gastos");
  revalidatePath("/admin");
  return gasto;
}

export async function actualizarGastoAction(id: string, input: GastoInput) {
  const datos = gastoSchema.parse(input);
  const gasto = await actualizarGasto(id, aFormInput(datos));
  revalidatePath("/admin/gastos");
  revalidatePath("/admin");
  return gasto;
}

export async function eliminarGastoAction(id: string) {
  await eliminarGasto(id);
  revalidatePath("/admin/gastos");
  revalidatePath("/admin");
}
