/** Adaptador para el proveedor de tracking (Postal Ninja) — aísla el resto
 * del código de la forma exacta de su API, por si algún día se cambia de
 * proveedor. Ver postal-ninja.ts para la implementación activa (verificada
 * con llamadas reales, no adivinada). */
export type EstadoTracking = {
  estado: string; // texto legible del último evento o estado
  enlace?: string; // link a la página pública de tracking del proveedor
  actualizadoEn: string; // ISO
};

export interface TrackingProvider {
  /** Da de alta un número de tracking en el proveedor. Devuelve el id
   * interno que el proveedor asigna — hay que guardarlo para poder
   * consultar el estado después (Postal Ninja identifica cada tracking
   * por ese id, no por el número en sí). */
  registrar(numero: string, carrierId: number): Promise<{ providerId: string }>;
  /** Consulta el estado actual de un tracking ya registrado, por su id
   * interno (el que devolvió registrar()). */
  consultarEstado(providerId: string): Promise<EstadoTracking>;
}
