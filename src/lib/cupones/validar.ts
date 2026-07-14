import type { CuponAlmacenado } from "./store";

export type ResultadoCupon =
  | { ok: true; cupon: CuponAlmacenado; descuento: number; envioGratis: boolean }
  | { ok: false; motivo: string };

/**
 * Reglas de negocio de cupones (sección 4.3 del brief): código vigente
 * dentro del rango de fechas, sin exceder usos máximos, y que cumpla el
 * monto mínimo de compra. Un cupón por pedido (no combinable). Función
 * pura y síncrona a propósito: el I/O (leer el cupón, su conteo de usos)
 * ya ocurrió antes de llamarla.
 */
export function validarCupon(
  cupon: CuponAlmacenado | undefined,
  params: { subtotal: number },
): ResultadoCupon {
  if (!cupon) return { ok: false, motivo: "El código ingresado no existe." };

  const ahora = new Date();
  if (ahora < new Date(cupon.fechaInicio) || ahora > new Date(cupon.fechaFin)) {
    return { ok: false, motivo: "Este cupón no está vigente." };
  }

  if (cupon.usosMaximos != null && cupon.usosActuales >= cupon.usosMaximos) {
    return { ok: false, motivo: "Este cupón alcanzó su límite de usos." };
  }

  if (params.subtotal < cupon.montoMinimoCompra) {
    return {
      ok: false,
      motivo: `Este cupón requiere una compra mínima de S/ ${cupon.montoMinimoCompra.toFixed(2)}.`,
    };
  }

  if (cupon.tipo === "envio_gratis") {
    return { ok: true, cupon, descuento: 0, envioGratis: true };
  }

  const descuentoBruto =
    cupon.tipo === "porcentaje" ? params.subtotal * (cupon.valor / 100) : cupon.valor;
  const descuento = Math.round(Math.min(descuentoBruto, params.subtotal) * 100) / 100;

  return { ok: true, cupon, descuento, envioGratis: false };
}
