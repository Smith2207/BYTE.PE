import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("Falta DATABASE_URL en las variables de entorno (ver .env.example).");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Pool sobre WebSocket (no el driver HTTP): necesario para tener
// transacciones reales con db.transaction() en checkout/cupones.
export const db = drizzle({ client: pool, schema });
