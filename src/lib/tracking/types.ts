/** Adaptador genérico para servicios de tracking de paquetes (17TRACK,
 * AfterShip, Trackingmore...) — permite cambiar de proveedor sin tocar el
 * resto del código. Ver seventeen-track.ts para la implementación activa. */
export type EstadoTracking = {
  estado: string; // texto legible, ej. "En tránsito — Miami, FL"
  actualizadoEn: string; // ISO
};

export interface TrackingProvider {
  /** Da de alta un número de tracking en el proveedor (algunos requieren
   * "registrar" antes de poder consultar estado). Es seguro llamarlo aunque
   * el número ya esté registrado. */
  registrar(numero: string, courier?: string): Promise<void>;
  /** Consulta el estado actual de un número ya registrado. */
  consultarEstado(numero: string, courier?: string): Promise<EstadoTracking>;
}
