# video-render

Servicio HTTP standalone que renderiza un video corto por producto con
[HyperFrames](https://github.com/heygen-com/hyperframes) y avisa a BYTE.PE
por webhook cuando termina. No se despliega con `vercel --prod` — va aparte,
en [Render](https://render.com), porque necesita Chrome headless + FFmpeg
como binarios reales, algo que las funciones serverless de Vercel no
soportan.

Feature experimental: HyperFrames es un proyecto OSS de ~4 meses sin
benchmarks de tiempo de render publicados.

## Deploy en Render

Con Blueprint (usa `render.yaml` de esta carpeta, más rápido):

1. En [dashboard.render.com](https://dashboard.render.com) → "New" →
   "Blueprint" (cuenta propia — esto no lo puede hacer un asistente por
   vos).
2. Elegir este repo. Render detecta `services/video-render/render.yaml`
   automáticamente.
3. Al crear el Blueprint, Render va a pedir valores para las variables
   marcadas `sync: false`:
   - `VIDEO_RENDER_SHARED_SECRET` — un secreto random (ej.
     `openssl rand -hex 32`), **igual** al que se configura en BYTE.PE
     (`.env.local` / variables de entorno de Vercel).
   - `WEBHOOK_URL` = `https://byte-pe.vercel.app/api/webhooks/video-producto`
   - `BLOB_READ_WRITE_TOKEN` — el mismo token de Vercel Blob que ya usa
     BYTE.PE (Vercel dashboard → Storage → tu Blob store → token).
4. Deploy. Render va a levantar el `Dockerfile` de esta carpeta y exponer
   una URL pública (ej. `https://byte-pe-video-render.onrender.com`).
5. En BYTE.PE, configurar `VIDEO_RENDER_SERVICE_URL` con esa URL (Vercel
   dashboard → Settings → Environment Variables, y `.env.local` para local).

Sin Blueprint (a mano, si preferís no usar `render.yaml`): "New" → "Web
Service" → elegir este repo → **Root Directory** `services/video-render` →
**Runtime** Docker → cargar las mismas variables de entorno del paso 3
arriba a mano en la pestaña "Environment".

Nota: el plan `starter` de Render duerme el servicio tras un rato sin
tráfico (cold start en el próximo render) y tiene límites de RAM/CPU más
chicos que Railway — si el render de HyperFrames resulta pesado (Chrome +
FFmpeg), puede hacer falta subir a un plan pago con más recursos.

## Probar

```bash
curl https://<tu-servicio>.onrender.com/health
# { "ok": true }

curl -X POST https://<tu-servicio>.onrender.com/render \
  -H "content-type: application/json" \
  -H "x-render-secret: <VIDEO_RENDER_SHARED_SECRET>" \
  -d '{
    "productoId": "test-123",
    "nombre": "Producto de prueba",
    "marca": "Marca",
    "precio": 199.9,
    "imagenes": ["https://ejemplo.com/foto.jpg"],
    "specsJson": { "procesador": "Intel Core i7", "ram": "16GB" }
  }'
# 202 { "ok": true, "status": "queued" }
# El resultado real llega después por POST a WEBHOOK_URL.
```

## Desarrollo local

Necesita Node 22+, FFmpeg y Chrome instalados localmente (o correr con
Docker: `docker build -t video-render . && docker run -p 8080:8080 --env-file .env video-render`).

```bash
npm install
npm run dev
```
