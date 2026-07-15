/** Couriers relevantes para este negocio, con su id real en el catálogo de
 * Postal Ninja (confirmado contra /v1/carriers) — no la lista completa
 * (~925), que no tiene sentido mostrar en un selector. */
export const COURIERS_INTERNACIONALES = [
  { id: 102, nombre: "USPS" },
  { id: 129, nombre: "UPS" },
  { id: 136, nombre: "DHL Express" },
  { id: 131, nombre: "DHL Germany" },
  { id: 139, nombre: "FedEx" },
];

export const COURIERS_NACIONALES = [
  { id: 844, nombre: "OLVA Courier" },
  { id: 727, nombre: "Urbano Peru" },
  { id: 382, nombre: "Serpost" },
];
