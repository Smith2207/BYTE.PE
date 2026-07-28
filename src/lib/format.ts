const formatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

export function formatoPEN(valor: number) {
  return formatter.format(valor);
}

const TASA_IGV = 0.18;

/**
 * Perú exige que el precio que ve el comprador sea el precio final (Código
 * de Protección y Defensa del Consumidor: sin sorpresas en el checkout).
 * Todos los precios del catálogo ya incluyen IGV — esta función NUNCA
 * suma un 18% extra, solo descompone cuánto de ese precio ya cobrado es
 * IGV, para mostrarlo en el comprobante. baseImponible + igv === precio.
 */
export function desglosarIGV(precioConIgv: number) {
  const baseImponible = Math.round((precioConIgv / (1 + TASA_IGV)) * 100) / 100;
  const igv = Math.round((precioConIgv - baseImponible) * 100) / 100;
  return { baseImponible, igv };
}

/**
 * Arma el texto de una dirección omitiendo la dirección exacta cuando no
 * se indicó (es opcional — no hacemos despacho a domicilio, el envío es
 * por agencia y esta línea solo sirve como referencia).
 */
export function formatoDireccion(direccion: {
  direccionExacta?: string | null;
  distrito: string;
  provincia: string;
  departamento: string;
}) {
  return [direccion.direccionExacta, direccion.distrito, direccion.provincia, direccion.departamento]
    .filter(Boolean)
    .join(", ");
}

/** Compartido entre la boleta (A4) y el ticket (80mm) — mismo texto en
 * los dos formatos de impresión de un pedido. */
export const METODO_PAGO_ETIQUETA: Record<string, string> = {
  yape: "Yape / Plin",
  prex: "Prex",
  transferencia: "Transferencia bancaria",
  contra_entrega: "Contra entrega",
  tarjeta: "Tarjeta de crédito/débito",
};

/** Formato tipo SUNAT (serie-correlativo) simulado a partir del número
 * interno de pedido — no es un comprobante homologado, ver aviso en la
 * boleta/ticket. Mismo cálculo en los dos formatos de impresión. */
export function numeroComprobante(numeroPedido: string, esFactura: boolean) {
  const correlativo = numeroPedido.replace(/\D/g, "").slice(-8).padStart(8, "0");
  return `${esFactura ? "F001" : "B001"}-${correlativo}`;
}
