import { regions, provinces, districts } from "@perucode/ubigeo-peru";

/**
 * Ubigeo real (INEI 2025 / RENIEC 2026, vía @perucode/ubigeo-peru) para
 * los selects en cascada departamento → provincia → distrito del
 * checkout y "Mis direcciones". La librería guarda los nombres en
 * MAYÚSCULAS; acá se normalizan a "Formato Título" en español.
 *
 * A nivel de departamento la librería no trae tildes (p.ej. "ANCASH",
 * "APURIMAC", "SAN MARTIN") — como son solo 25 y fijos, se corrigen a
 * mano. Provincias y distritos sí traen tildes correctas de origen.
 */
const CONECTORES = new Set(["de", "del", "la", "las", "los", "y"]);

function tituloEspanol(nombre: string): string {
  return nombre
    .toLowerCase()
    .split(" ")
    .map((palabra, i) =>
      i > 0 && CONECTORES.has(palabra)
        ? palabra
        : palabra.charAt(0).toUpperCase() + palabra.slice(1),
    )
    .join(" ");
}

const NOMBRES_DEPARTAMENTO_CORREGIDOS: Record<string, string> = {
  Ancash: "Áncash",
  Apurimac: "Apurímac",
  Huanuco: "Huánuco",
  Junin: "Junín",
  "San Martin": "San Martín",
};

const todasLasRegiones = regions
  .all()
  .map((r) => {
    const base = tituloEspanol(r.name);
    return { id: r.id, nombre: NOMBRES_DEPARTAMENTO_CORREGIDOS[base] ?? base };
  })
  .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

export const departamentosPeru = todasLasRegiones.map((r) => r.nombre);

function idDepartamento(departamento: string) {
  return todasLasRegiones.find((r) => r.nombre === departamento)?.id ?? null;
}

function idProvincia(departamento: string, provincia: string) {
  const regionId = idDepartamento(departamento);
  if (regionId == null) return null;
  return (
    provinces
      .byRegionId(regionId)
      .find((p) => tituloEspanol(p.name) === provincia)?.id ?? null
  );
}

export function getProvinciasDe(departamento: string): string[] {
  const regionId = idDepartamento(departamento);
  if (regionId == null) return [];
  return provinces
    .byRegionId(regionId)
    .map((p) => tituloEspanol(p.name))
    .sort((a, b) => a.localeCompare(b, "es"));
}

export function getDistritosDe(departamento: string, provincia: string): string[] {
  const provinciaId = idProvincia(departamento, provincia);
  if (provinciaId == null) return [];
  return districts
    .byProvinceId(provinciaId)
    .map((d) => tituloEspanol(d.name))
    .sort((a, b) => a.localeCompare(b, "es"));
}
