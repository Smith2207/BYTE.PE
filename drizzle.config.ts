import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// dotenv/config solo carga .env por defecto — este proyecto sigue la
// convención de Next.js y guarda las credenciales en .env.local.
config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("Falta DATABASE_URL en las variables de entorno (ver .env.example).");
}

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
