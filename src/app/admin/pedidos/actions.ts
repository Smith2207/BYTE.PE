"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { actualizarEstadoPedido, type PedidoMock } from "@/lib/pedidos/store";
import { registrarAccion } from "@/lib/bitacora/store";

export async function actualizarEstadoPedidoAction(
  numeroPedido: string,
  estado: PedidoMock["estado"],
  datos?: { courier?: string; numeroTracking?: string },
) {
  const session = await auth();
  const pedido = await actualizarEstadoPedido(numeroPedido, estado, datos);
  if (session?.user?.id) {
    await registrarAccion(
      { id: session.user.id, nombre: session.user.name ?? session.user.email ?? "admin" },
      "cambiar_estado_pedido",
      { numeroPedido, estado, ...datos },
    );
  }
  revalidatePath("/admin/pedidos");
  revalidatePath(`/pedido/${numeroPedido}`);
  return pedido;
}
