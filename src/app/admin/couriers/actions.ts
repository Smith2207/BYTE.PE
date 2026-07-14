"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  crearCourier,
  actualizarCourier,
  eliminarCourier,
  crearTarifaCourier,
  eliminarTarifaCourier,
} from "@/lib/couriers/store";

const courierSchema = z.object({
  nombre: z.string().min(2, "Ingresa el nombre del courier"),
  trackingUrlPattern: z.string().optional(),
});

export async function crearCourierAction(input: z.infer<typeof courierSchema>) {
  const datos = courierSchema.parse(input);
  const courier = await crearCourier(datos);
  revalidatePath("/admin/couriers");
  return courier;
}

export async function actualizarCourierAction(
  id: string,
  input: Partial<z.infer<typeof courierSchema>> & { activo?: boolean },
) {
  const courier = await actualizarCourier(id, input);
  revalidatePath("/admin/couriers");
  return courier;
}

export async function eliminarCourierAction(id: string) {
  await eliminarCourier(id);
  revalidatePath("/admin/couriers");
}

const tarifaSchema = z.object({
  courierId: z.string().min(1),
  departamento: z.string().min(1, "Selecciona un departamento"),
  costo: z.number().nonnegative("Ingresa un costo válido"),
  diasEstimadosMin: z.number().int().min(0),
  diasEstimadosMax: z.number().int().min(0),
});

export async function crearTarifaCourierAction(input: z.infer<typeof tarifaSchema>) {
  const datos = tarifaSchema.parse(input);
  const tarifa = await crearTarifaCourier(datos);
  revalidatePath("/admin/couriers");
  return tarifa;
}

export async function eliminarTarifaCourierAction(id: string) {
  await eliminarTarifaCourier(id);
  revalidatePath("/admin/couriers");
}
