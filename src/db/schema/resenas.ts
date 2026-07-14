import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { productos } from "./catalogo";
import { usuarios } from "./usuarios";

export const resenas = pgTable("resenas", {
  id: uuid("id").defaultRandom().primaryKey(),
  productoId: uuid("producto_id")
    .notNull()
    .references(() => productos.id, { onDelete: "cascade" }),
  usuarioId: uuid("usuario_id")
    .notNull()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  // 1 a 5, validado en la capa de aplicación (drizzle no aplica CHECK aquí).
  calificacion: integer("calificacion").notNull(),
  comentario: text("comentario"),
  fotoUrl: text("foto_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Resena = typeof resenas.$inferSelect;
export type NuevaResena = typeof resenas.$inferInsert;
