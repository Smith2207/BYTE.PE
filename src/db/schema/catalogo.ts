import {
  AnyPgColumn,
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const categorias = pgTable("categorias", {
  id: uuid("id").defaultRandom().primaryKey(),
  nombre: text("nombre").notNull(),
  slug: text("slug").notNull().unique(),
  // Autoreferencia para subcategorías (ej. "Laptops" > "Gaming").
  categoriaPadreId: uuid("categoria_padre_id").references((): AnyPgColumn => categorias.id),
  imagen: text("imagen"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const productos = pgTable("productos", {
  id: uuid("id").defaultRandom().primaryKey(),
  nombre: text("nombre").notNull(),
  slug: text("slug").notNull().unique(),
  descripcion: text("descripcion"),
  precio: numeric("precio", { precision: 10, scale: 2 }).notNull(),
  precioOferta: numeric("precio_oferta", { precision: 10, scale: 2 }),
  // Costo de adquisición (compra/importación) — solo visible en el admin,
  // se usa para calcular el margen de ganancia. Nulo hasta que se registre
  // una compra o se edite a mano.
  costoAdquisicion: numeric("costo_adquisicion", { precision: 10, scale: 2 }),
  stock: integer("stock").notNull().default(0),
  sku: text("sku").unique(),
  marca: text("marca"),
  categoriaId: uuid("categoria_id").references(() => categorias.id),
  pesoKg: numeric("peso_kg", { precision: 6, scale: 2 }),
  altoCm: numeric("alto_cm", { precision: 6, scale: 2 }),
  anchoCm: numeric("ancho_cm", { precision: 6, scale: 2 }),
  largoCm: numeric("largo_cm", { precision: 6, scale: 2 }),
  imagenes: text("imagenes").array().notNull().default([]),
  specsJson: jsonb("specs_json").$type<Record<string, string>>().default({}),
  garantiaMeses: integer("garantia_meses").notNull().default(0),
  destacado: boolean("destacado").notNull().default(false),
  activo: boolean("activo").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const variantesProducto = pgTable("variantes_producto", {
  id: uuid("id").defaultRandom().primaryKey(),
  productoId: uuid("producto_id")
    .notNull()
    .references(() => productos.id, { onDelete: "cascade" }),
  // ej: "color", "ram", "almacenamiento"
  atributo: text("atributo").notNull(),
  // ej: "Negro", "16GB", "512GB SSD"
  valor: text("valor").notNull(),
  precioExtra: numeric("precio_extra", { precision: 10, scale: 2 }).notNull().default("0"),
  stock: integer("stock").notNull().default(0),
  sku: text("sku"),
});

export type Categoria = typeof categorias.$inferSelect;
export type NuevaCategoria = typeof categorias.$inferInsert;
export type Producto = typeof productos.$inferSelect;
export type NuevoProducto = typeof productos.$inferInsert;
export type VarianteProducto = typeof variantesProducto.$inferSelect;
export type NuevaVarianteProducto = typeof variantesProducto.$inferInsert;
