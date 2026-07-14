"use server";

import { reclamoSchema, type ReclamoInput } from "@/lib/validations/reclamo";

function generarFolio() {
  const anio = new Date().getFullYear();
  const sufijo = Date.now().toString(36).toUpperCase().slice(-6);
  return `RC-${anio}-${sufijo}`;
}

export async function registrarReclamo(input: ReclamoInput) {
  const datos = reclamoSchema.parse(input);
  const montoReclamado = datos.montoReclamado ? Number(datos.montoReclamado) : undefined;
  const folio = generarFolio();

  // Sin DATABASE_URL configurado (fase de prueba sin BD todavía) dejamos
  // constancia en el log del servidor; con Neon conectado, esto pasa a
  // insertarse en la tabla `reclamos` (ver src/db/schema/soporte.ts).
  if (!process.env.DATABASE_URL) {
    console.log("[libro-de-reclamaciones] Nuevo reclamo (modo demo, sin BD):", {
      folio,
      ...datos,
    });
    return { folio, persistido: false };
  }

  const { db } = await import("@/db");
  const { reclamos } = await import("@/db/schema");
  await db.insert(reclamos).values({
    folio,
    tipo: datos.tipo,
    tipoDocumento: datos.tipoDocumento,
    numeroDocumento: datos.numeroDocumento,
    nombre: datos.nombre,
    apellidos: datos.apellidos,
    domicilio: datos.domicilio,
    telefono: datos.telefono,
    email: datos.email,
    esMenorEdad: datos.esMenorEdad,
    tipoBien: datos.tipoBien,
    montoReclamado: montoReclamado?.toFixed(2),
    descripcionBien: datos.descripcionBien,
    detalleReclamo: datos.detalleReclamo,
  });

  return { folio, persistido: true };
}
