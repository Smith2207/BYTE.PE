import { NextRequest, NextResponse } from "next/server";
import { Payment } from "mercadopago";
import { getMercadoPagoClient } from "@/lib/mercadopago/client";
import { actualizarEstadoPedido } from "@/lib/pedidos/store";
import { notificarErrorCritico } from "@/lib/monitoreo/notificar-error";

/**
 * Notificación de pago de Mercado Pago (Checkout Pro). En sandbox, el
 * simulador de pagos de tu cuenta de prueba dispara este webhook igual
 * que en producción. Ver notification_url en checkout/actions.ts.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const paymentId = body?.data?.id ?? req.nextUrl.searchParams.get("data.id");
  const tipo = body?.type ?? req.nextUrl.searchParams.get("type");

  if (tipo !== "payment" || !paymentId) {
    return NextResponse.json({ ok: true });
  }

  try {
    const client = getMercadoPagoClient();
    const pago = await new Payment(client).get({ id: paymentId });
    const numeroPedido = pago.external_reference;
    if (!numeroPedido) return NextResponse.json({ ok: true });

    if (pago.status === "approved") {
      await actualizarEstadoPedido(numeroPedido, "pagado");
    } else if (pago.status === "rejected" || pago.status === "cancelled") {
      await actualizarEstadoPedido(numeroPedido, "cancelado");
    }
    // "pending"/"in_process": se deja el pedido como está, MP reintenta el webhook.
  } catch (error) {
    // Sin esto, un webhook fallando en silencio (token vencido, etc.) solo
    // se nota cuando un cliente reclama que pagó y su pedido nunca cambió.
    await notificarErrorCritico("webhook de Mercado Pago", error);
    // Devolvemos 200 igual: si respondemos error, MP reintenta indefinidamente
    // notificaciones que probablemente seguirán fallando (ej. token inválido).
  }

  return NextResponse.json({ ok: true });
}
