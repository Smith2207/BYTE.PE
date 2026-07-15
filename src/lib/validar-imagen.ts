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

const FIRMA_PDF = { ext: "pdf", mime: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46] }; // "%PDF"

function coincideFirma(buffer: Uint8Array, firma: { ext: string; bytes: number[] }) {
  const coincide = firma.bytes.every((b, i) => buffer[i] === b);
  if (!coincide) return false;
  if (firma.ext === "webp") {
    return [0x57, 0x45, 0x42, 0x50].every((b, i) => buffer[8 + i] === b);
  }
  return true;
}

export function detectarTipoImagen(buffer: Uint8Array): { ext: string; mime: string } | null {
  for (const firma of FIRMAS) {
    if (coincideFirma(buffer, firma)) return { ext: firma.ext, mime: firma.mime };
  }
  return null;
}

/** Igual que detectarTipoImagen, pero también acepta PDF — para comprobantes
 * de compra (factura/voucher), que pueden venir en cualquiera de los dos
 * formatos. No usar esto donde solo deban aceptarse imágenes (ej. fotos de
 * producto). */
export function detectarTipoArchivo(buffer: Uint8Array): { ext: string; mime: string } | null {
  if (coincideFirma(buffer, FIRMA_PDF)) return { ext: FIRMA_PDF.ext, mime: FIRMA_PDF.mime };
  return detectarTipoImagen(buffer);
}
