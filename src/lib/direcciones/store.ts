import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { direcciones } from "@/db/schema";

export type DireccionAlmacenada = {
  id: string;
  usuarioId: string;
  departamento: string;
  provincia: string;
  distrito: string;
  direccionExacta?: string;
  referencia?: string;
  esPrincipal: boolean;
};

function aDireccionAlmacenada(d: typeof direcciones.$inferSelect): DireccionAlmacenada {
  return {
    id: d.id,
    // Solo se usa para direcciones GUARDADAS (siempre tienen usuarioId) —
    // los snapshots de envío de pedidos de invitado no pasan por acá.
    usuarioId: d.usuarioId!,
    departamento: d.departamento,
    provincia: d.provincia,
    distrito: d.distrito,
    direccionExacta: d.direccionExacta ?? undefined,
    referencia: d.referencia ?? undefined,
    esPrincipal: d.esPrincipal,
  };
}

export async function listarDireccionesPorUsuario(usuarioId: string) {
  const filas = await db.select().from(direcciones).where(eq(direcciones.usuarioId, usuarioId));
  return filas.map(aDireccionAlmacenada);
}

export async function crearDireccion(input: Omit<DireccionAlmacenada, "id">) {
  return db.transaction(async (tx) => {
    if (input.esPrincipal) {
      await tx
        .update(direcciones)
        .set({ esPrincipal: false })
        .where(eq(direcciones.usuarioId, input.usuarioId));
    }
    const [fila] = await tx
      .insert(direcciones)
      .values({
        usuarioId: input.usuarioId,
        departamento: input.departamento,
        provincia: input.provincia,
        distrito: input.distrito,
        direccionExacta: input.direccionExacta,
        referencia: input.referencia,
        esPrincipal: input.esPrincipal,
      })
      .returning();
    return aDireccionAlmacenada(fila);
  });
}

export async function eliminarDireccion(id: string, usuarioId: string) {
  await db
    .delete(direcciones)
    .where(and(eq(direcciones.id, id), eq(direcciones.usuarioId, usuarioId)));
}

export async function marcarDireccionPrincipal(id: string, usuarioId: string) {
  await db.transaction(async (tx) => {
    await tx
      .update(direcciones)
      .set({ esPrincipal: false })
      .where(eq(direcciones.usuarioId, usuarioId));
    await tx
      .update(direcciones)
      .set({ esPrincipal: true })
      .where(and(eq(direcciones.id, id), eq(direcciones.usuarioId, usuarioId)));
  });
}
