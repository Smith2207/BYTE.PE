/**
 * Valida el tipo real de archivo por sus primeros bytes (magic bytes), no
 * por la extensión o el `Content-Type` declarado por el navegador —
 * ambos son fáciles de falsificar. Mismo enfoque usado en el hardening
 * de subida de archivos del otro proyecto (PAWPATROLL).
 */
const FIRMAS: { ext: string; mime: string; bytes: number[] }[] = [
  { ext: "jpg", mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { ext: "png", mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { ext: "gif", mime: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38] },
  { ext: "webp", mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] }, // + "WEBP" en offset 8
];

export function detectarTipoImagen(buffer: Uint8Array): { ext: string; mime: string } | null {
  for (const firma of FIRMAS) {
    const coincide = firma.bytes.every((b, i) => buffer[i] === b);
    if (!coincide) continue;
    if (firma.ext === "webp") {
      const esWebp = [0x57, 0x45, 0x42, 0x50].every((b, i) => buffer[8 + i] === b);
      if (!esWebp) continue;
    }
    return { ext: firma.ext, mime: firma.mime };
  }
  return null;
}
