import { desc } from "drizzle-orm";
import { db } from "@/db";
import { bitacoraAdmin } from "@/db/schema";

export type EntradaBitacora = {
  id: string;
  usuarioNombre: string;
  accion: string;
  detalle: Record<string, unknown> | null;
  createdAt: string;
};

/** No lanza ni bloquea al llamador si falla — una entrada de auditoría
 * perdida no debe tumbar la acción real (cambiar un pedido, borrar un
 * producto, etc.), que ya ocurrió. */
export async function registrarAccion(
  usuario: { id: string; nombre: string },
  accion: string,
  detalle?: Record<string, unknown>,
) {
  try {
    await db.insert(bitacoraAdmin).values({
      usuarioId: usuario.id,
      usuarioNombre: usuario.nombre,
      accion,
      detalle: detalle ?? null,
    });
  } catch (error) {
    console.error("[bitacora] Error registrando acción:", accion, error);
  }
}

export async function listarBitacora(limit = 200): Promise<EntradaBitacora[]> {
  const filas = await db
    .select()
    .from(bitacoraAdmin)
    .orderBy(desc(bitacoraAdmin.createdAt))
    .limit(limit);
  return filas.map((f) => ({
    id: f.id,
    usuarioNombre: f.usuarioNombre,
    accion: f.accion,
    detalle: f.detalle,
    createdAt: f.createdAt.toISOString(),
  }));
}
