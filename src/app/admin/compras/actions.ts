"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
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
import { registrarAccion } from "@/lib/bitacora/store";

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
  const session = await auth();
  const compra = await confirmarRecepcionCompra(id, precios);
  if (session?.user?.id) {
    // Esta acción suma stock y recalcula el costo de adquisición por
    // promedio ponderado de verdad — vale la pena que quede quién la
    // confirmó, no solo cuándo.
    await registrarAccion(
      { id: session.user.id, nombre: session.user.name ?? session.user.email ?? "admin" },
      "confirmar_recepcion_compra",
      { compraId: id },
    );
  }
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
