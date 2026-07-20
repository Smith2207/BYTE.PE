import { eq } from "drizzle-orm";
import { db } from "@/db";
import { avisosStock } from "@/db/schema";

export async function listarAvisosStockPendientes() {
  return db
    .select({ id: avisosStock.id, productoId: avisosStock.productoId, email: avisosStock.email })
    .from(avisosStock)
    .where(eq(avisosStock.notificado, false));
}

export async function marcarAvisoNotificado(id: string) {
  await db.update(avisosStock).set({ notificado: true }).where(eq(avisosStock.id, id));
}
