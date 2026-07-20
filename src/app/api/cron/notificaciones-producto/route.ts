import { NextRequest, NextResponse } from "next/server";
import { cronAutorizado } from "@/lib/cron/auth";
import { listarAvisosStockPendientes, marcarAvisoNotificado } from "@/lib/soporte/store";
import {
  actualizarPrecioNotificado,
  listarWishlistConBajadaDePrecio,
} from "@/lib/wishlist/store";
import { getProductoPorId } from "@/lib/mock/repo";
import { enviarCorreo } from "@/lib/email/client";
import { plantillaAvisoStockDisponible, plantillaBajadaPrecioWishlist } from "@/lib/email/plantillas";

export const dynamic = "force-dynamic";

async function procesarAvisosStock() {
  const pendientes = await listarAvisosStockPendientes();
  let enviados = 0;
  for (const aviso of pendientes) {
    const producto = await getProductoPorId(aviso.productoId);
    if (!producto || producto.stock <= 0) continue;
    const { enviado } = await enviarCorreo({
      para: aviso.email,
      asunto: `Ya volvió el stock: ${producto.nombre}`,
      html: plantillaAvisoStockDisponible(producto),
    });
    if (enviado) enviados++;
    await marcarAvisoNotificado(aviso.id);
  }
  return enviados;
}

async function procesarBajadasPrecioWishlist() {
  const filas = await listarWishlistConBajadaDePrecio();
  let enviados = 0;
  for (const fila of filas) {
    const producto = await getProductoPorId(fila.productoId);
    if (!producto) continue;
    const precioAnterior = Number(fila.precioNotificado ?? producto.precioFinal);
    const { enviado } = await enviarCorreo({
      para: fila.email,
      asunto: `Bajó de precio: ${producto.nombre}`,
      html: plantillaBajadaPrecioWishlist(producto, precioAnterior, producto.precioFinal),
    });
    if (enviado) enviados++;
    await actualizarPrecioNotificado(fila.wishlistId, producto.precioFinal);
  }
  return enviados;
}

export async function GET(req: NextRequest) {
  if (!cronAutorizado(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [avisosStockEnviados, wishlistEnviados] = await Promise.all([
    procesarAvisosStock(),
    procesarBajadasPrecioWishlist(),
  ]);

  return NextResponse.json({ ok: true, avisosStockEnviados, wishlistEnviados });
}
