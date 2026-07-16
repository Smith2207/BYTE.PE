import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { guardarResultadoVideo } from "@/lib/mock/repo";

/**
 * Recibe el resultado del render de video de un producto desde
 * services/video-render (Render) — ver ese servicio y
 * VIDEO_RENDER_SHARED_SECRET en .env.example. Mismo estilo que el webhook
 * de Mercado Pago: responde 200 salvo error de auth, para no generar
 * reintentos infinitos del lado del servicio de render.
 */
export async function POST(req: NextRequest) {
  const secretoEsperado = process.env.VIDEO_RENDER_SHARED_SECRET;
  if (!secretoEsperado) {
    console.error("[webhook video-producto] Falta VIDEO_RENDER_SHARED_SECRET en el entorno.");
    return NextResponse.json({ ok: false, error: "not configured" }, { status: 500 });
  }

  const recibido = req.headers.get("x-render-secret") ?? "";
  const bufEsperado = Buffer.from(secretoEsperado);
  const bufRecibido = Buffer.from(recibido);
  const coincide =
    bufEsperado.length === bufRecibido.length && timingSafeEqual(bufEsperado, bufRecibido);
  if (!coincide) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const productoId = body?.productoId;
  if (!productoId || typeof productoId !== "string") {
    return NextResponse.json({ ok: true });
  }

  try {
    if (typeof body.videoUrl === "string" && body.videoUrl) {
      await guardarResultadoVideo(productoId, { videoUrl: body.videoUrl });
    } else {
      const error = typeof body.error === "string" ? body.error : "render fallido";
      console.error(`[webhook video-producto] Render falló para ${productoId}: ${error}`);
      await guardarResultadoVideo(productoId, { error });
    }
  } catch (error) {
    console.error("[webhook video-producto] Error guardando resultado:", error);
  }

  return NextResponse.json({ ok: true });
}
