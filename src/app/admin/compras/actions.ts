"use server";

import { revalidatePath } from "next/cache";
import {
  crearCompra,
  actualizarEstadoCompra,
  actualizarImpuestosCompra,
  previsualizarCostosFinales,
  confirmarRecepcionCompra,
  actualizarTrackingCompra,
  type CompraFormInput,
  type CompraAlmacenada,
} from "@/lib/compras/store";

export async function crearCompraAction(input: CompraFormInput) {
  const compra = await crearCompra(input);
  revalidatePath("/admin/compras");
  revalidatePath("/admin");
  return compra;
}

export async function actualizarEstadoCompraAction(id: string, estado: CompraAlmacenada["estado"]) {
  const compra = await actualizarEstadoCompra(id, estado);
  revalidatePath("/admin/compras");
  revalidatePath(`/admin/compras/${id}`);
  revalidatePath("/admin/productos");
  revalidatePath("/admin");
  return compra;
}

export async function actualizarImpuestosCompraAction(
  id: string,
  input: { pagoImpuestos: boolean; montoImpuestos?: number },
) {
  const compra = await actualizarImpuestosCompra(id, input);
  revalidatePath("/admin/compras");
  revalidatePath(`/admin/compras/${id}`);
  return compra;
}

export async function previsualizarCostosFinalesAction(id: string) {
  return previsualizarCostosFinales(id);
}

export async function confirmarRecepcionCompraAction(
  id: string,
  precios: { itemId: string; precioVenta: number }[],
) {
  const compra = await confirmarRecepcionCompra(id, precios);
  revalidatePath("/admin/compras");
  revalidatePath(`/admin/compras/${id}`);
  revalidatePath("/admin/productos");
  revalidatePath("/admin");
  return compra;
}

export async function actualizarTrackingCompraAction(
  id: string,
  tramo: "internacional" | "nacional",
) {
  const compra = await actualizarTrackingCompra(id, tramo);
  revalidatePath(`/admin/compras/${id}`);
  return compra;
}
