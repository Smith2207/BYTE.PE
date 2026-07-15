import crearCliente17Track from "./seventeen-track";
import type { TrackingProvider, EstadoTracking } from "./types";

export type { EstadoTracking };

/** true si hay un proveedor de tracking configurado — la UI usa esto para
 * mostrar el botón "Actualizar tracking" habilitado o no, sin romper nada
 * si todavía no se configuró TRACKING_API_KEY. */
export function trackingDisponible() {
  return Boolean(process.env.TRACKING_API_KEY);
}

function proveedorActivo(): TrackingProvider {
  const apiKey = process.env.TRACKING_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Configura TRACKING_API_KEY para activar el tracking automático (ver src/lib/tracking/seventeen-track.ts).",
    );
  }
  return crearCliente17Track(apiKey);
}

export async function consultarEstadoTracking(numero: string, courier?: string) {
  const proveedor = proveedorActivo();
  await proveedor.registrar(numero, courier);
  return proveedor.consultarEstado(numero, courier);
}
