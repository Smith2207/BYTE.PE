"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  aprobarSolicitud,
  rechazarSolicitud,
  completarReembolso,
  obtenerSolicitud,
} from "@/lib/devoluciones/store";
import { getPedido } from "@/lib/pedidos/store";
import { enviarCorreo } from "@/lib/email/client";
import { plantillaSolicitudDevolucionActualizada } from "@/lib/email/plantillas";

async function notificarCliente(
  solicitudId: string,
  estado: "aprobada" | "rechazada" | "completada",
  notaAdmin?: string | null,
  montoReembolsado?: number | null,
) {
  const solicitud = await obtenerSolicitud(solicitudId);
  if (!solicitud) return;
  const pedido = await getPedido(solicitud.pedidoNumero);
  if (!pedido) return;

  await enviarCorreo({
    para: pedido.emailComprador,
    asunto: `Actualización de tu solicitud — pedido ${solicitud.pedidoNumero}`,
    html: plantillaSolicitudDevolucionActualizada({
      nombre: pedido.nombreComprador,
      pedidoNumero: solicitud.pedidoNumero,
      estado,
      notaAdmin,
      montoReembolsado,
    }),
  });
}

export async function aprobarSolicitudAction(id: string) {
  const solicitud = await aprobarSolicitud(id);
  await notificarCliente(id, "aprobada");
  revalidatePath("/admin/devoluciones");
  revalidatePath("/cuenta/pedidos");
  return solicitud;
}

const rechazoSchema = z.string().min(5, "Explica brevemente el motivo del rechazo");

export async function rechazarSolicitudAction(id: string, notaAdmin: string) {
  const nota = rechazoSchema.parse(notaAdmin);
  const solicitud = await rechazarSolicitud(id, nota);
  await notificarCliente(id, "rechazada", nota);
  revalidatePath("/admin/devoluciones");
  revalidatePath("/cuenta/pedidos");
  return solicitud;
}

export async function completarReembolsoAction(id: string, montoReembolsado: number) {
  const solicitud = await completarReembolso(id, montoReembolsado);
  await notificarCliente(id, "completada", null, montoReembolsado);
  revalidatePath("/admin/devoluciones");
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/productos");
  revalidatePath("/cuenta/pedidos");
  return solicitud;
}
