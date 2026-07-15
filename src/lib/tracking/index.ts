import crearClientePostalNinja from "./postal-ninja";
import type { TrackingProvider, EstadoTracking } from "./types";

export type { EstadoTracking };
export { COURIERS_INTERNACIONALES, COURIERS_NACIONALES } from "./carriers";

/** true si hay un proveedor de tracking configurado — la UI usa esto para
 * mostrar el botón "Actualizar tracking" habilitado o no, sin romper nada
 * si todavía no se configuró POSTAL_NINJA_API_KEY. */
export function trackingDisponible() {
  return Boolean(process.env.POSTAL_NINJA_API_KEY);
}

function proveedorActivo(): TrackingProvider {
  const apiKey = process.env.POSTAL_NINJA_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Configura POSTAL_NINJA_API_KEY para activar el tracking automático (ver src/lib/tracking/postal-ninja.ts).",
    );
  }
  return crearClientePostalNinja(apiKey);
}

export async function registrarTracking(numero: string, carrierId: number) {
  return proveedorActivo().registrar(numero, carrierId);
}

export async function consultarEstadoTracking(providerId: string) {
  return proveedorActivo().consultarEstado(providerId);
}
