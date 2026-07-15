import { and, asc, desc, eq, gte, ilike, inArray, lte, ne, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { categorias, productos, variantesProducto } from "@/db/schema";

/**
 * Repositorio de catálogo sobre Postgres (Neon) vía Drizzle. Reemplaza al
 * repositorio de archivos JSON que existió mientras no había base de
 * datos — misma firma pública que entonces, ahora asíncrona porque las
 * consultas van a la base real.
 */

export type CategoriaAlmacenada = {
  id: string;
  nombre: string;
  slug: string;
  categoriaPadreId: string | null;
};

export type ProductoAlmacenado = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  precio: number;
  precioOferta: number | null;
  // Costo de compra/importación — dato interno, nunca se expone en
  // ProductoCatalogo (el tipo que consume el catálogo público).
  costoAdquisicion: number | null;
  stock: number;
  sku: string;
  marca: string;
  categoriaId: string;
  pesoKg: number | null;
  imagenes: string[];
  specsJson: Record<string, string>;
  garantiaMeses: number;
  destacado: boolean;
  activo: boolean;
};

export type VarianteAlmacenada = {
  id: string;
  productoId: string;
  atributo: string;
  valor: string;
  precioExtra: number;
  stock: number;
};

export type CategoriaConHijas = {
  id: string;
  nombre: string;
  slug: string;
  subcategorias: { id: string; nombre: string; slug: string }[];
};

export type ProductoCatalogo = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  precio: number;
  precioOferta: number | null;
  precioFinal: number;
  descuentoPorcentaje: number;
  stock: number;
  disponible: boolean;
  sku: string;
  marca: string;
  categoria: { id: string; nombre: string; slug: string };
  pesoKg: number | null;
  imagenes: string[];
  specsJson: Record<string, string>;
  garantiaMeses: number;
  destacado: boolean;
  createdAt: string;
  // Si tiene variantes (talla, color...), no se puede "agregar al carrito"
  // sin elegir una primero — la card del listado usa esto para decidir si
  // muestra el botón rápido de agregar o manda al detalle a elegir.
  tieneVariantes: boolean;
};

export type VarianteCatalogo = {
  id: string;
  atributo: string;
  valor: string;
  precioExtra: number;
  stock: number;
};

/** numeric(...) de Postgres llega como string por precisión — se convierte acá, en un solo lugar. */
function num(valor: string | null | undefined): number {
  return valor == null ? 0 : Number(valor);
}
function numNullable(valor: string | null | undefined): number | null {
  return valor == null ? null : Number(valor);
}

function slugify(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function aProductoAlmacenado(p: typeof productos.$inferSelect): ProductoAlmacenado {
  return {
    id: p.id,
    nombre: p.nombre,
    slug: p.slug,
    descripcion: p.descripcion ?? "",
    precio: num(p.precio),
    precioOferta: numNullable(p.precioOferta),
    costoAdquisicion: numNullable(p.costoAdquisicion),
    stock: p.stock,
    sku: p.sku ?? "",
    marca: p.marca ?? "",
    categoriaId: p.categoriaId ?? "",
    pesoKg: numNullable(p.pesoKg),
    imagenes: p.imagenes,
    specsJson: p.specsJson ?? {},
    garantiaMeses: p.garantiaMeses,
    destacado: p.destacado,
    activo: p.activo,
  };
}

function aProductoCatalogo(
  p: typeof productos.$inferSelect,
  categoria: { id: string; nombre: string; slug: string } | undefined,
  tieneVariantes: boolean,
): ProductoCatalogo {
  const precio = num(p.precio);
  const precioOferta = numNullable(p.precioOferta);
  const precioFinal = precioOferta ?? precio;
  const descuentoPorcentaje = precioOferta ? Math.round((1 - precioOferta / precio) * 100) : 0;
  return {
    id: p.id,
    nombre: p.nombre,
    slug: p.slug,
    descripcion: p.descripcion ?? "",
    precio,
    precioOferta,
    precioFinal,
    descuentoPorcentaje,
    stock: p.stock,
    disponible: p.stock > 0,
    sku: p.sku ?? "",
    marca: p.marca ?? "",
    categoria: categoria ?? { id: p.categoriaId ?? "", nombre: "Sin categoría", slug: "" },
    pesoKg: numNullable(p.pesoKg),
    imagenes: p.imagenes,
    specsJson: p.specsJson ?? {},
    garantiaMeses: p.garantiaMeses,
    destacado: p.destacado,
    createdAt: p.createdAt.toISOString(),
    tieneVariantes,
  };
}

/** Qué productos (de esta lista de ids) tienen al menos una variante — una
 * sola consulta extra por listado, mismo patrón que mapaCategorias(), en
 * vez de N+1 consultas por producto. */
async function mapaTieneVariantes(productoIds: string[]): Promise<Set<string>> {
  if (productoIds.length === 0) return new Set();
  const filas = await db
    .selectDistinct({ productoId: variantesProducto.productoId })
    .from(variantesProducto)
    .where(inArray(variantesProducto.productoId, productoIds));
  return new Set(filas.map((f) => f.productoId));
}

async function mapaCategorias() {
  const todas = await db.select().from(categorias);
  return new Map(todas.map((c) => [c.id, { id: c.id, nombre: c.nombre, slug: c.slug }]));
}

// ---------- Lecturas públicas del catálogo ----------

export async function getCategorias(): Promise<CategoriaConHijas[]> {
  const todas = await db.select().from(categorias);
  return todas
    .filter((c) => !c.categoriaPadreId)
    .map((c) => ({
      id: c.id,
      nombre: c.nombre,
      slug: c.slug,
      subcategorias: todas
        .filter((sub) => sub.categoriaPadreId === c.id)
        .map((sub) => ({ id: sub.id, nombre: sub.nombre, slug: sub.slug })),
    }));
}

export async function getMarcas(): Promise<string[]> {
  const filas = await db
    .selectDistinct({ marca: productos.marca })
    .from(productos)
    .where(eq(productos.activo, true));
  return filas.map((f) => f.marca).filter((m): m is string => Boolean(m)).sort();
}

/** Solo slug + fecha de actualización, para el sitemap — evita traer la
 * ficha completa de cada producto solo para listar URLs. */
export async function listarSlugsProductos(): Promise<{ slug: string; updatedAt: Date }[]> {
  return db
    .select({ slug: productos.slug, updatedAt: productos.updatedAt })
    .from(productos)
    .where(eq(productos.activo, true));
}

export async function getProductosDestacados(limit = 4): Promise<ProductoCatalogo[]> {
  const categoriasPorId = await mapaCategorias();
  const filas = await db
    .select()
    .from(productos)
    .where(and(eq(productos.activo, true), eq(productos.destacado, true)))
    .limit(limit);
  const conVariantes = await mapaTieneVariantes(filas.map((p) => p.id));
  return filas.map((p) =>
    aProductoCatalogo(p, categoriasPorId.get(p.categoriaId ?? ""), conVariantes.has(p.id)),
  );
}

export type FiltrosProductos = {
  categoriaSlug?: string;
  marcas?: string[];
  precioMin?: number;
  precioMax?: number;
  orden?: "relevancia" | "precio-asc" | "precio-desc" | "nuevo";
  busqueda?: string;
  page?: number;
  pageSize?: number;
};

export async function getProductos(filtros: FiltrosProductos = {}) {
  const { marcas, precioMin, precioMax, orden = "relevancia", busqueda } = filtros;
  const page = filtros.page ?? 1;
  const pageSize = filtros.pageSize ?? 12;

  const condiciones = [eq(productos.activo, true)];

  if (filtros.categoriaSlug) {
    const todasCategorias = await db.select().from(categorias);
    const categoria = todasCategorias.find((c) => c.slug === filtros.categoriaSlug);
    if (categoria) {
      const idsValidos = categoria.categoriaPadreId
        ? [categoria.id]
        : [
            categoria.id,
            ...todasCategorias.filter((c) => c.categoriaPadreId === categoria.id).map((c) => c.id),
          ];
      condiciones.push(inArray(productos.categoriaId, idsValidos));
    } else {
      // Slug de categoría inexistente: no hay resultados posibles.
      condiciones.push(eq(productos.categoriaId, "00000000-0000-0000-0000-000000000000"));
    }
  }
  if (marcas?.length) condiciones.push(inArray(productos.marca, marcas));
  // precioFinal = precio_oferta si existe, si no precio — se compara con COALESCE en SQL.
  const precioFinalSql = sql`coalesce(${productos.precioOferta}, ${productos.precio})`;
  if (precioMin != null) condiciones.push(gte(precioFinalSql, precioMin.toFixed(2)));
  if (precioMax != null) condiciones.push(lte(precioFinalSql, precioMax.toFixed(2)));
  if (busqueda) {
    const q = `%${busqueda}%`;
    condiciones.push(or(ilike(productos.nombre, q), ilike(productos.marca, q))!);
  }

  const where = and(...condiciones);

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(productos)
    .where(where);

  let orderBy = desc(productos.createdAt);
  if (orden === "precio-asc") orderBy = asc(precioFinalSql) as unknown as typeof orderBy;
  if (orden === "precio-desc") orderBy = desc(precioFinalSql) as unknown as typeof orderBy;
  if (orden === "nuevo") orderBy = desc(productos.createdAt);

  const filas = await db
    .select()
    .from(productos)
    .where(where)
    .orderBy(orderBy)
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const categoriasPorId = await mapaCategorias();
  const conVariantes = await mapaTieneVariantes(filas.map((p) => p.id));
  const items = filas.map((p) =>
    aProductoCatalogo(p, categoriasPorId.get(p.categoriaId ?? ""), conVariantes.has(p.id)),
  );

  return { items, total, page, pageSize };
}

export async function getProductoBySlug(slug: string) {
  const categoriasPorId = await mapaCategorias();
  const [productoFila] = await db
    .select()
    .from(productos)
    .where(and(eq(productos.slug, slug), eq(productos.activo, true)))
    .limit(1);
  if (!productoFila) return null;

  const variantesFilas = await db
    .select()
    .from(variantesProducto)
    .where(eq(variantesProducto.productoId, productoFila.id));
  const variantes: VarianteCatalogo[] = variantesFilas.map((v) => ({
    id: v.id,
    atributo: v.atributo,
    valor: v.valor,
    precioExtra: num(v.precioExtra),
    stock: v.stock,
  }));

  const producto = aProductoCatalogo(
    productoFila,
    categoriasPorId.get(productoFila.categoriaId ?? ""),
    variantesFilas.length > 0,
  );

  const relacionadosFilas = productoFila.categoriaId
    ? await db
        .select()
        .from(productos)
        .where(
          and(
            eq(productos.activo, true),
            eq(productos.categoriaId, productoFila.categoriaId),
            ne(productos.id, producto.id),
          ),
        )
        .limit(4)
    : [];
  const conVariantesRelacionados = await mapaTieneVariantes(relacionadosFilas.map((p) => p.id));
  const relacionados = relacionadosFilas.map((p) =>
    aProductoCatalogo(p, categoriasPorId.get(p.categoriaId ?? ""), conVariantesRelacionados.has(p.id)),
  );

  return { producto, variantes, relacionados };
}

export async function getProductoPorId(productoId: string): Promise<ProductoCatalogo | null> {
  const categoriasPorId = await mapaCategorias();
  const [p] = await db.select().from(productos).where(eq(productos.id, productoId)).limit(1);
  if (!p) return null;
  const conVariantes = await mapaTieneVariantes([p.id]);
  return aProductoCatalogo(p, categoriasPorId.get(p.categoriaId ?? ""), conVariantes.has(p.id));
}

/**
 * Descuenta stock al confirmar un pedido. El llamador (checkout/actions.ts)
 * la ejecuta dentro de una transacción junto con la creación del pedido.
 */
export async function decrementarStock(
  productoId: string,
  varianteId: string | null,
  cantidad: number,
  tx: Pick<typeof db, "update"> = db,
) {
  await tx
    .update(productos)
    .set({ stock: sql`greatest(0, ${productos.stock} - ${cantidad})` })
    .where(eq(productos.id, productoId));
  if (varianteId) {
    await tx
      .update(variantesProducto)
      .set({ stock: sql`greatest(0, ${variantesProducto.stock} - ${cantidad})` })
      .where(eq(variantesProducto.id, varianteId));
  }
}

/**
 * Inversa de decrementarStock — al completar un reembolso (ver
 * src/lib/devoluciones/store.ts) el producto vuelve al inventario. A
 * diferencia de registrarIngresoPorCompra, NO toca el costo de
 * adquisición: una devolución de cliente no cambia lo que pagaste al
 * proveedor por esa unidad.
 */
export async function restaurarStock(
  productoId: string,
  varianteId: string | null,
  cantidad: number,
  tx: Pick<typeof db, "update"> = db,
) {
  await tx
    .update(productos)
    .set({ stock: sql`${productos.stock} + ${cantidad}` })
    .where(eq(productos.id, productoId));
  if (varianteId) {
    await tx
      .update(variantesProducto)
      .set({ stock: sql`${variantesProducto.stock} + ${cantidad}` })
      .where(eq(variantesProducto.id, varianteId));
  }
}

/**
 * Al recibir una compra (ver src/lib/compras/store.ts): suma stock y
 * recalcula el costo de adquisición como promedio ponderado entre el
 * stock que ya había y el que entra, un método de costeo estándar en
 * contabilidad de inventarios.
 */
export async function registrarIngresoPorCompra(
  productoId: string,
  cantidad: number,
  costoUnitario: number,
) {
  const [producto] = await db.select().from(productos).where(eq(productos.id, productoId)).limit(1);
  if (!producto) return;

  const stockPrevio = producto.stock;
  const costoPrevio = numNullable(producto.costoAdquisicion) ?? costoUnitario;
  const costoPonderado =
    (stockPrevio * costoPrevio + cantidad * costoUnitario) / (stockPrevio + cantidad);

  await db
    .update(productos)
    .set({
      stock: stockPrevio + cantidad,
      costoAdquisicion: (Math.round(costoPonderado * 100) / 100).toFixed(2),
    })
    .where(eq(productos.id, productoId));
}

/** Solo el conteo, para la campana de notificaciones del admin — evita
 * traer la lista completa de productos en cada navegación. */
export async function contarAlertasStock() {
  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(productos)
    .where(and(eq(productos.activo, true), lte(productos.stock, 5)));
  return total;
}

// ---------- CRUD de administración ----------

export async function adminListarProductos(): Promise<
  (ProductoAlmacenado & { categoriaNombre: string })[]
> {
  const categoriasPorId = await mapaCategorias();
  const filas = await db.select().from(productos).orderBy(desc(productos.createdAt));
  return filas.map((p) => ({
    ...aProductoAlmacenado(p),
    categoriaNombre: categoriasPorId.get(p.categoriaId ?? "")?.nombre ?? "Sin categoría",
  }));
}

export async function adminObtenerProducto(id: string): Promise<ProductoAlmacenado | null> {
  const [p] = await db.select().from(productos).where(eq(productos.id, id)).limit(1);
  return p ? aProductoAlmacenado(p) : null;
}

export type ProductoFormInput = Omit<ProductoAlmacenado, "id" | "slug" | "activo"> & {
  slug?: string;
};

export async function adminCrearProducto(input: ProductoFormInput): Promise<ProductoAlmacenado> {
  const [fila] = await db
    .insert(productos)
    .values({
      nombre: input.nombre,
      slug: input.slug || slugify(input.nombre),
      descripcion: input.descripcion,
      precio: input.precio.toFixed(2),
      precioOferta: input.precioOferta != null ? input.precioOferta.toFixed(2) : null,
      costoAdquisicion: input.costoAdquisicion != null ? input.costoAdquisicion.toFixed(2) : null,
      stock: input.stock,
      sku: input.sku,
      marca: input.marca,
      categoriaId: input.categoriaId || null,
      pesoKg: input.pesoKg != null ? input.pesoKg.toFixed(2) : null,
      imagenes: input.imagenes,
      specsJson: input.specsJson,
      garantiaMeses: input.garantiaMeses,
      destacado: input.destacado,
      activo: true,
    })
    .returning();
  return aProductoAlmacenado(fila);
}

export async function adminActualizarProducto(
  id: string,
  input: Partial<ProductoFormInput>,
): Promise<ProductoAlmacenado> {
  const cambios: Partial<typeof productos.$inferInsert> = {};
  if (input.nombre !== undefined) {
    cambios.nombre = input.nombre;
    cambios.slug = input.slug || slugify(input.nombre);
  }
  if (input.slug !== undefined) cambios.slug = input.slug;
  if (input.descripcion !== undefined) cambios.descripcion = input.descripcion;
  if (input.precio !== undefined) cambios.precio = input.precio.toFixed(2);
  if (input.precioOferta !== undefined)
    cambios.precioOferta = input.precioOferta != null ? input.precioOferta.toFixed(2) : null;
  if (input.costoAdquisicion !== undefined)
    cambios.costoAdquisicion = input.costoAdquisicion != null ? input.costoAdquisicion.toFixed(2) : null;
  if (input.stock !== undefined) cambios.stock = input.stock;
  if (input.sku !== undefined) cambios.sku = input.sku;
  if (input.marca !== undefined) cambios.marca = input.marca;
  if (input.categoriaId !== undefined) cambios.categoriaId = input.categoriaId || null;
  if (input.pesoKg !== undefined) cambios.pesoKg = input.pesoKg != null ? input.pesoKg.toFixed(2) : null;
  if (input.imagenes !== undefined) cambios.imagenes = input.imagenes;
  if (input.specsJson !== undefined) cambios.specsJson = input.specsJson;
  if (input.garantiaMeses !== undefined) cambios.garantiaMeses = input.garantiaMeses;
  if (input.destacado !== undefined) cambios.destacado = input.destacado;
  cambios.updatedAt = new Date();

  const [fila] = await db.update(productos).set(cambios).where(eq(productos.id, id)).returning();
  if (!fila) throw new Error("Producto no encontrado");
  return aProductoAlmacenado(fila);
}

export async function adminEliminarProducto(id: string) {
  await db.delete(productos).where(eq(productos.id, id));
}

export async function adminListarCategorias(): Promise<CategoriaAlmacenada[]> {
  const filas = await db.select().from(categorias);
  return filas.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    slug: c.slug,
    categoriaPadreId: c.categoriaPadreId,
  }));
}

export async function adminCrearCategoria(input: {
  nombre: string;
  categoriaPadreId: string | null;
}): Promise<CategoriaAlmacenada> {
  const [fila] = await db
    .insert(categorias)
    .values({
      nombre: input.nombre,
      slug: slugify(input.nombre),
      categoriaPadreId: input.categoriaPadreId,
    })
    .returning();
  return {
    id: fila.id,
    nombre: fila.nombre,
    slug: fila.slug,
    categoriaPadreId: fila.categoriaPadreId,
  };
}

export async function adminActualizarCategoria(
  id: string,
  input: Partial<{ nombre: string; categoriaPadreId: string | null }>,
): Promise<CategoriaAlmacenada> {
  const cambios: Partial<typeof categorias.$inferInsert> = {};
  if (input.nombre) {
    cambios.nombre = input.nombre;
    cambios.slug = slugify(input.nombre);
  }
  if (input.categoriaPadreId !== undefined) cambios.categoriaPadreId = input.categoriaPadreId;

  const [fila] = await db.update(categorias).set(cambios).where(eq(categorias.id, id)).returning();
  if (!fila) throw new Error("Categoría no encontrada");
  return {
    id: fila.id,
    nombre: fila.nombre,
    slug: fila.slug,
    categoriaPadreId: fila.categoriaPadreId,
  };
}

export async function adminEliminarCategoria(id: string) {
  await db.delete(categorias).where(or(eq(categorias.id, id), eq(categorias.categoriaPadreId, id)));
}
