import { pgTable, timestamp, uuid, unique } from "drizzle-orm/pg-core";
import { productos } from "./catalogo";
import { usuarios } from "./usuarios";

export const wishlist = pgTable(
  "wishlist",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    usuarioId: uuid("usuario_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    productoId: uuid("producto_id")
      .notNull()
      .references(() => productos.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.usuarioId, t.productoId)],
);

export type WishlistItem = typeof wishlist.$inferSelect;
