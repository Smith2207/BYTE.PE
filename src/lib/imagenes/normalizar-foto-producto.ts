import sharp from "sharp";

// Lienzo cuadrado grande — de sobra para el `sizes` más grande usado en
// ProductoMedia (50vw en el hero de producto) sin verse pixelado, y
// liviano una vez comprimido a WebP.
const LADO = 1600;
const FONDO = { r: 255, g: 255, b: 255, alpha: 1 } as const;

/**
 * Normaliza una foto de producto para que todas se vean consistentes en
 * el catálogo (estilo "fondo blanco liso" ya usado en el sitio, ver
 * ProductoMedia) sin importar el tamaño, proporción o fondo de la foto
 * original que suba el admin (a veces viene tal cual de la publicación
 * de Amazon/eBay del proveedor):
 *
 * 1. `flatten` — si la foto es un PNG con transparencia, la transparencia
 *    se rellena de blanco (si no, se vería negra o distinta según dónde
 *    se muestre).
 * 2. `trim` — si la foto ya trae márgenes de un color uniforme (blanco u
 *    otro), se recortan, para no encimar padding sobre padding. Umbral
 *    más alto que el default (10): con fotos JPEG reales, el borde entre
 *    el margen y el producto casi nunca es 100% nítido (hay un par de
 *    píxeles de transición por la compresión) — con el umbral por
 *    defecto ese anillo de píxeles "ni fondo ni producto" queda adentro
 *    del recorte y, al agrandarlo para llenar el lienzo, se nota como un
 *    borde de color feo alrededor del producto.
 * 3. `resize` con `fit: "contain"` — encaja la foto completa dentro de un
 *    cuadrado sin recortar nada del producto (a diferencia del
 *    `object-cover` que ya usa ProductoMedia para mostrarla, que sí
 *    recorta): una foto vertical u horizontal queda centrada con relleno
 *    blanco a los costados en vez de perder las puntas del producto.
 * 4. Se convierte a WebP — mismo formato para todas, liviano.
 *
 * Esto no reemplaza una foto de producto bien tomada (no quita fondos
 * complejos ni mejora la iluminación), pero sí evita el efecto "collage"
 * de fotos de tamaños y fondos distintos mezcladas en la misma grilla.
 */
export async function normalizarFotoProducto(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .flatten({ background: FONDO })
    .trim({ threshold: 30 })
    .resize(LADO, LADO, { fit: "contain", background: FONDO })
    .webp({ quality: 85 })
    .toBuffer();
}
