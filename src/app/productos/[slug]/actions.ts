"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { crearResena } from "@/lib/resenas/store";

const avisoSchema = z.object({
  productoId: z.string().min(1),
  email: z.string().email(),
});

const resenaSchema = z.object({
  productoId: z.string().min(1),
  productoSlug: z.string().min(1),
  calificacion: z.number().min(1).max(5),
  comentario: z.string().min(5, "Cuéntanos un poco más sobre tu experiencia"),
});

export async function crearResenaAction(input: {
  productoId: string;
  productoSlug: string;
  calificacion: number;
  comentario: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Debes iniciar sesión para dejar una reseña");

  const datos = resenaSchema.parse(input);
  await crearResena({
    productoId: datos.productoId,
    usuarioId: session.user.id,
    calificacion: datos.calificacion,
    comentario: datos.comentario,
  });
  revalidatePath(`/productos/${datos.productoSlug}`);
  return { ok: true };
}

export async function registrarAvisoStock(input: { productoId: string; email: string }) {
  const datos = avisoSchema.parse(input);

  if (!process.env.DATABASE_URL) {
    console.log("[avisos-stock] Nuevo aviso (modo demo, sin BD):", datos);
    return { ok: true };
  }

  const { db } = await import("@/db");
  const { avisosStock } = await import("@/db/schema");
  await db.insert(avisosStock).values(datos);
  return { ok: true };
}
