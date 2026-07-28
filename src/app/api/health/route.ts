import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";

/**
 * Endpoint público de solo lectura para monitoreo externo de uptime
 * (UptimeRobot, Better Uptime, etc.) — sin esto, la única señal de que el
 * sitio está caído era que alguien avisara. No expone nada sensible, solo
 * si la app responde y si puede hablar con la base de datos.
 */
export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return NextResponse.json({ ok: true, db: true }, { status: 200 });
  } catch (error) {
    console.error("[health] Base de datos no disponible:", error);
    return NextResponse.json({ ok: false, db: false }, { status: 503 });
  }
}
