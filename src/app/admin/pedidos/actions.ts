"use server";

import { revalidatePath } from "next/cache";
import { actualizarEstadoPedido, type PedidoMock } from "@/lib/pedidos/store";

export async function actualizarEstadoPedidoAction(
  numeroPedido: string,
  estado: PedidoMock["estado"],
  datos?: { courier?: string; numeroTracking?: string },
) {
  const pedido = await actualizarEstadoPedido(numeroPedido, estado, datos);
  revalidatePath("/admin/pedidos");
  revalidatePath(`/pedido/${numeroPedido}`);
  return pedido;
}
