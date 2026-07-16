import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { put } from "@vercel/blob";
import express from "express";
import { generarComposicionHtml, type DatosProducto } from "./composicion.js";

const execFileAsync = promisify(execFile);

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
const SHARED_SECRET = process.env.VIDEO_RENDER_SHARED_SECRET;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

// Falla rápido al arrancar si falta algo — mejor un crash claro en los logs
// de Render que aceptar pedidos que van a fallar silenciosamente después.
for (const [nombre, valor] of Object.entries({
  VIDEO_RENDER_SHARED_SECRET: SHARED_SECRET,
  WEBHOOK_URL: WEBHOOK_URL,
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
})) {
  if (!valor) {
    console.error(`Falta la variable de entorno ${nombre}.`);
    process.exit(1);
  }
}

const app = express();
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/render", (req, res) => {
  const recibido = req.header("x-render-secret") ?? "";
  if (recibido !== SHARED_SECRET) {
    res.status(401).json({ ok: false, error: "unauthorized" });
    return;
  }

  const datos = req.body as Partial<DatosProducto>;
  if (!datos?.productoId || !datos.nombre || !Array.isArray(datos.imagenes)) {
    res.status(400).json({ ok: false, error: "faltan productoId/nombre/imagenes" });
    return;
  }

  // Responde de inmediato — HyperFrames no publica un tiempo esperado de
  // render (proyecto OSS joven, sin benchmarks). El resultado real llega
  // después por webhook a BYTE.PE, no en esta respuesta.
  res.status(202).json({ ok: true, status: "queued" });

  renderYNotificar(datos as DatosProducto).catch((err) => {
    console.error(`[render] Error no capturado para ${datos.productoId}:`, err);
  });
});

async function renderYNotificar(datos: DatosProducto) {
  let dir: string | null = null;
  try {
    dir = await mkdtemp(path.join(tmpdir(), "hf-"));
    const videoUrl = await renderizarVideo(datos, dir);
    await avisarWebhook({ productoId: datos.productoId, videoUrl });
  } catch (err) {
    console.error(`[render] Falló el render de ${datos.productoId}:`, err);
    await avisarWebhook({
      productoId: datos.productoId,
      error: err instanceof Error ? err.message : "Error desconocido en el render",
    });
  } finally {
    if (dir) await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

async function renderizarVideo(datos: DatosProducto, dir: string): Promise<string> {
  const html = generarComposicionHtml(datos);
  await writeFile(path.join(dir, "index.html"), html, "utf-8");

  const salida = path.join(dir, "output.mp4");
  await execFileAsync(
    "hyperframes",
    ["render", "--output", salida, "--fps", "30", "--quality", "standard"],
    { cwd: dir, timeout: 10 * 60 * 1000 },
  );

  const buffer = await readFile(salida);
  const blob = await put(`videos-producto/${datos.productoId}-${randomUUID()}.mp4`, buffer, {
    access: "public",
    contentType: "video/mp4",
  });
  return blob.url;
}

async function avisarWebhook(payload: { productoId: string; videoUrl?: string; error?: string }) {
  try {
    const res = await fetch(WEBHOOK_URL!, {
      method: "POST",
      headers: { "content-type": "application/json", "x-render-secret": SHARED_SECRET! },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error(`[webhook] BYTE.PE respondió ${res.status} para ${payload.productoId}`);
    }
  } catch (err) {
    console.error(`[webhook] No se pudo avisar a BYTE.PE para ${payload.productoId}:`, err);
  }
}

app.listen(PORT, () => {
  console.log(`video-render escuchando en :${PORT}`);
});
