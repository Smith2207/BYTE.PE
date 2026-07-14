"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { getPedido } from "@/lib/pedidos/store";
import { crearSolicitudDevolucion, tieneSolicitudActiva } from "@/lib/devoluciones/store";
import { enviarCorreo } from "@/lib/email/client";
import { plantillaSolicitudDevolucionRecibida } from "@/lib/email/plantillas";

const solicitudSchema = z.object({
  tipo: z.enum(["reembolso", "cambio"]),
  motivo: z.string().min(15, "Cuéntanos con más detalle qué pasó (mínimo 15 caracteres)"),
});

export async function solicitarDevolucionAction(
  numeroPedido: string,
  input: { tipo: "reembolso" | "cambio"; motivo: string },
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Debes iniciar sesión");

  const pedido = await getPedido(numeroPedido);
  if (!pedido || pedido.usuarioId !== session.user.id) {
    throw new Error("Pedido no encontrado");
  }
  if (pedido.estado !== "entregado") {
    throw new Error("Solo puedes solicitar una devolución de un pedido ya entregado");
  }
  if (await tieneSolicitudActiva(pedido.id)) {
    throw new Error("Ya existe una solicitud registrada para este pedido");
  }

  const datos = solicitudSchema.parse(input);
  await crearSolicitudDevolucion({
    pedidoId: pedido.id,
    usuarioId: session.user.id,
    tipo: datos.tipo,
    motivo: datos.motivo,
  });

  await enviarCorreo({
    para: pedido.emailComprador,
    asunto: `Recibimos tu solicitud — pedido ${pedido.numeroPedido}`,
    html: plantillaSolicitudDevolucionRecibida({
      nombre: pedido.nombreComprador,
      pedidoNumero: pedido.numeroPedido,
      tipo: datos.tipo,
      motivo: datos.motivo,
    }),
  });

  revalidatePath("/cuenta/pedidos");
}
