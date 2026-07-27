/**
 * Costeo por promedio ponderado: método estándar de contabilidad de
 * inventarios para mezclar el costo que ya tenías en stock con el costo
 * de una nueva entrada de mercadería. Función pura (sin DB) a propósito,
 * separada de registrarIngresoPorCompra (src/lib/mock/repo.ts) para poder
 * probarla sin tocar Postgres.
 */
export function calcularCostoPonderado(
  stockPrevio: number,
  costoPrevio: number,
  cantidadNueva: number,
  costoUnitarioNuevo: number,
): number {
  if (stockPrevio + cantidadNueva === 0) return costoUnitarioNuevo;
  const costoPonderado =
    (stockPrevio * costoPrevio + cantidadNueva * costoUnitarioNuevo) / (stockPrevio + cantidadNueva);
  return Math.round(costoPonderado * 100) / 100;
}
