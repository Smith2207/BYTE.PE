import type { TrackingProvider } from "./types";

const BASE_URL = "https://postal-ninja.p.rapidapi.com/v1";
const RAPIDAPI_HOST = "postal-ninja.p.rapidapi.com";

// Todas las importaciones de este negocio llegan a Perú — evita pedir un
// campo más en el formulario para algo que nunca cambia.
const DEST_COUNTRY = "PE";

type RespuestaCrearPista = { status: string; pkgId: number; trackCode: string };
type EventoPista = { description?: string; status?: string; name?: string };
type RespuestaGetTrack = {
  status: string;
  pkg?: {
    list: string; // "ACTIVE" | "ARCHIVED" | ...
    events: EventoPista[];
    publicUrl?: string;
    lastFetched?: string;
  };
};

/** Cliente para Postal Ninja (https://postal.ninja, vía RapidAPI) —
 * verificado con llamadas reales contra la API: crear un tracking devuelve
 * `{status, pkgId, trackCode}`, y consultarlo devuelve `{pkg: {list,
 * events[], publicUrl, lastFetched}}`. El shape exacto de cada evento
 * dentro de `events[]` no se pudo confirmar con datos reales (el número de
 * prueba usado no tenía movimientos) — se extrae de forma defensiva
 * probando varios nombres de campo posibles. */
function crearClientePostalNinja(apiKey: string): TrackingProvider {
  async function llamar(path: string, init: RequestInit) {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": RAPIDAPI_HOST,
        Accept: "application/json; charset=UTF-8",
        ...init.headers,
      },
    });
    if (!res.ok) {
      throw new Error(`Postal Ninja respondió ${res.status} en ${path}`);
    }
    return res.json();
  }

  return {
    async registrar(numero, carrierId) {
      const data: RespuestaCrearPista = await llamar("/track", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          trackCode: numero,
          ds: String(carrierId),
          destCountry: DEST_COUNTRY,
        }),
      });
      if (!data.pkgId) {
        throw new Error("Postal Ninja no devolvió un id de tracking");
      }
      return { providerId: String(data.pkgId) };
    },

    async consultarEstado(providerId) {
      const data: RespuestaGetTrack = await llamar(`/track/${providerId}?await=true&lang=EN`, {
        method: "GET",
      });
      const pkg = data.pkg;
      if (!pkg) {
        throw new Error("Postal Ninja no encontró ese tracking");
      }

      const ultimoEvento = pkg.events?.[0];
      const estado = ultimoEvento
        ? (ultimoEvento.description ?? ultimoEvento.status ?? ultimoEvento.name ?? JSON.stringify(ultimoEvento))
        : pkg.list === "ACTIVE"
          ? "Registrado, sin movimientos todavía"
          : pkg.list;

      return {
        estado,
        enlace: pkg.publicUrl,
        actualizadoEn: pkg.lastFetched ?? new Date().toISOString(),
      };
    },
  };
}

export default crearClientePostalNinja;
