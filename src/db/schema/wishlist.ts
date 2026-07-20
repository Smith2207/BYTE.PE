import { numeric, pgTable, timestamp, uuid, unique } from "drizzle-orm/pg-core";
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
    // Precio final (oferta o regular) del producto la última vez que se
    // notificó al usuario (o al agregarlo, como baseline). El cron de
    // alertas solo avisa si el precio actual bajó de este valor.
    precioNotificado: numeric("precio_notificado", { precision: 10, scale: 2 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.usuarioId, t.productoId)],
);

export type WishlistItem = typeof wishlist.$inferSelect;
