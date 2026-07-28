import { boolean, integer, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { productos } from "./catalogo";
import { usuarios } from "./usuarios";
import { estadoResenaEnum } from "./enums";

export const resenas = pgTable(
  "resenas",
  {
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
    // true si el autor tiene un pedido no cancelado con este producto —
    // calculado una sola vez al crear la reseña (ver crearResena).
    compraVerificada: boolean("compra_verificada").notNull().default(false),
    // Queda "pendiente" hasta que un admin la revisa en /admin/resenas —
    // nunca se publica un comentario sin que nadie lo vea antes.
    estado: estadoResenaEnum("estado").notNull().default("pendiente"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    // Un usuario no puede dejar más de una reseña por producto. El orden
    // de columnas importa para qué consultas puede usar este índice:
    // productoId primero porque listarResenasPorProducto (una vez por
    // cada visita a la ficha de producto) filtra solo por eso — con
    // usuarioId primero, esa consulta no podría usar el índice.
    unaPorProductoYUsuario: uniqueIndex("resenas_producto_usuario_unq").on(t.productoId, t.usuarioId),
  }),
);

export type Resena = typeof resenas.$inferSelect;
export type NuevaResena = typeof resenas.$inferInsert;
