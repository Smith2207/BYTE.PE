import { NextRequest, NextResponse } from "next/server";
import { cronAutorizado } from "@/lib/cron/auth";
import { listarCarritosAbandonados, marcarRecordatorioEnviado } from "@/lib/carrito/store";
import { enviarCorreo } from "@/lib/email/client";
import { plantillaCarritoAbandonado } from "@/lib/email/plantillas";

export const dynamic = "force-dynamic";

const HORAS_INACTIVIDAD = 6;

export async function GET(req: NextRequest) {
  if (!cronAutorizado(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const carritos = await listarCarritosAbandonados(HORAS_INACTIVIDAD);
  let enviados = 0;

  for (const carrito of carritos) {
    const subtotal = carrito.items.reduce((acc, i) => acc + i.cantidad * i.precioUnitario, 0);
    const { enviado } = await enviarCorreo({
      para: carrito.email,
      asunto: "Dejaste algo en tu carrito",
      html: plantillaCarritoAbandonado({ nombre: carrito.nombre, items: carrito.items, subtotal }),
    });
    if (enviado) enviados++;
    await marcarRecordatorioEnviado(carrito.carritoId);
  }

  return NextResponse.json({ ok: true, enviados });
}
