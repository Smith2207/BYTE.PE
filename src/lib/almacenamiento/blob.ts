import { del } from "@vercel/blob";

/**
 * Borra archivos de Vercel Blob que ya no están en uso (foto de producto
 * reemplazada/quitada, producto eliminado). Sin esto, cada reemplazo deja
 * un archivo huérfano ocupando espacio para siempre — Vercel Blob no los
 * borra solo. Se ignoran URLs que no son de Blob (ej. `/uploads/...` del
 * fallback de disco en desarrollo local) y no hace nada si falta el
 * token, mismo criterio de "degradar con gracia" que el resto del sitio.
 */
export async function eliminarArchivosBlob(urls: (string | null | undefined)[]) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;

  const urlsBlob = urls.filter(
    (u): u is string => !!u && u.includes(".public.blob.vercel-storage.com"),
  );
  if (urlsBlob.length === 0) return;

  try {
    await del(urlsBlob);
  } catch (error) {
    // No bloquea la operación real (guardar el producto, borrarlo) por
    // un archivo que no se pudo limpiar — solo se registra.
    console.error("[blob] Error borrando archivos huérfanos:", error);
  }
}
