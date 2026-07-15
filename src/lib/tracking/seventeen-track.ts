import type { TrackingProvider } from "./types";

const BASE_URL = "https://api.17track.net/track/v2.2";

/** Implementación para 17TRACK (https://www.17track.net) — cobertura amplia
 * de couriers internacionales (USPS/UPS/FedEx/DHL) y locales de Perú.
 * Requiere una cuenta y API key propias del usuario — no se puede probar
 * en vivo sin TRACKING_API_KEY configurada. */
function crearCliente17Track(apiKey: string): TrackingProvider {
  async function llamar(endpoint: string, body: unknown) {
    const res = await fetch(`${BASE_URL}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "17token": apiKey },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`17TRACK respondió ${res.status} en ${endpoint}`);
    }
    return res.json();
  }

  return {
    async registrar(numero, courier) {
      await llamar("register", [{ number: numero, ...(courier ? { carrier: courier } : {}) }]);
    },

    async consultarEstado(numero) {
      const data = await llamar("gettrackinfo", [{ number: numero }]);
      const aceptado = data?.data?.accepted?.[0];
      const estadoTexto: string | undefined =
        aceptado?.track_info?.latest_status?.status ??
        aceptado?.track_info?.latest_event?.description;

      if (!estadoTexto) {
        throw new Error("17TRACK no devolvió información para ese número");
      }
      return { estado: estadoTexto, actualizadoEn: new Date().toISOString() };
    },
  };
}

export default crearCliente17Track;
