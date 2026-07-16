# video-render

Servicio HTTP standalone que renderiza un video corto por producto con
[HyperFrames](https://github.com/heygen-com/hyperframes) y avisa a BYTE.PE
por webhook cuando termina. No se despliega con `vercel --prod` — va aparte,
en Railway (o Render/Fly.io), porque necesita Chrome headless + FFmpeg como
binarios reales, algo que las funciones serverless de Vercel no soportan.

Feature experimental: HyperFrames es un proyecto OSS de ~4 meses sin
benchmarks de tiempo de render publicados.

## Deploy en Railway

1. Crear un proyecto en [railway.app](https://railway.app) (cuenta propia —
   esto no lo puede hacer un asistente por vos).
2. "New Service" → "Deploy from GitHub repo" → elegir este repo.
3. En **Settings → Root Directory**, poner `services/video-render` (Railway
   soporta monorepos: detecta el `Dockerfile` de esta carpeta solo).
4. En **Variables**, configurar:
   - `VIDEO_RENDER_SHARED_SECRET` — un secreto random (ej.
     `openssl rand -hex 32`), **igual** al que se configura en BYTE.PE
     (`.env.local` / variables de entorno de Vercel).
   - `WEBHOOK_URL` = `https://byte-pe.vercel.app/api/webhooks/video-producto`
   - `BLOB_READ_WRITE_TOKEN` — el mismo token de Vercel Blob que ya usa
     BYTE.PE (Vercel dashboard → Storage → tu Blob store → token).
5. Deploy. Railway va a levantar el `Dockerfile` de esta carpeta y exponer
   una URL pública (ej. `https://video-render-production.up.railway.app`).
6. En BYTE.PE, configurar `VIDEO_RENDER_SERVICE_URL` con esa URL (Vercel
   dashboard → Settings → Environment Variables, y `.env.local` para local).

## Probar

```bash
curl https://<tu-servicio>.up.railway.app/health
# { "ok": true }

curl -X POST https://<tu-servicio>.up.railway.app/render \
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
