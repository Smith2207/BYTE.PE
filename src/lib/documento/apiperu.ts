/**
 * Consulta DNI/RUC vía apiperu.dev (https://docs.apiperu.dev) — solo para
 * AUTOCOMPLETAR datos en el checkout, nunca para bloquear la compra: si
 * falta el token, la API está caída o el documento no aparece, el
 * resultado es simplemente `null` y el usuario completa manualmente
 * (sección 5 del brief).
 */

type RespuestaDni = {
  success: boolean;
  data?: {
    numero: string;
    nombre_completo: string;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
  };
};

type RespuestaRuc = {
  success: boolean;
  data?: {
    ruc: string;
    nombre_o_razon_social: string;
    estado: string;
    condicion: string;
    direccion_completa: string;
    departamento: string;
    provincia: string;
    distrito: string;
  };
};

async function llamarApiPeru<T>(endpoint: "dni" | "ruc", body: Record<string, string>): Promise<T | null> {
  const token = process.env.APIPERU_TOKEN;
  if (!token) return null;

  try {
    const res = await fetch(`https://apiperu.dev/api/${endpoint}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    // Timeout, API caída, red, etc. — nunca bloquear el checkout por esto.
    return null;
  }
}

export async function consultarDni(dni: string) {
  const respuesta = await llamarApiPeru<RespuestaDni>("dni", { dni });
  if (!respuesta?.success || !respuesta.data) return null;
  return {
    nombreCompleto: `${respuesta.data.nombres} ${respuesta.data.apellido_paterno} ${respuesta.data.apellido_materno}`.trim(),
  };
}

export async function consultarRuc(ruc: string) {
  const respuesta = await llamarApiPeru<RespuestaRuc>("ruc", { ruc });
  if (!respuesta?.success || !respuesta.data) return null;
  return {
    razonSocial: respuesta.data.nombre_o_razon_social,
    estado: respuesta.data.estado,
    direccion: respuesta.data.direccion_completa,
  };
}
