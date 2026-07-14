import { config } from "dotenv";
config({ path: ".env.local" });
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import bcrypt from "bcryptjs";
import * as schema from "../src/db/schema";
import {
  categoriasSeed,
  productosSeed,
  variantesSeed,
  tarifasEnvioSeed,
  cuponesSeed,
} from "../src/data/catalogo-seed";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

async function main() {
  console.log("Sembrando datos de ejemplo...");

  // --- Categorías: primero las que no tienen padre, luego las que sí ---
  const sinPadre = categoriasSeed.filter((c) => !c.categoriaPadreSlug);
  const conPadre = categoriasSeed.filter((c) => c.categoriaPadreSlug);

  const categoriasInsertadas = await db
    .insert(schema.categorias)
    .values(sinPadre.map((c) => ({ nombre: c.nombre, slug: c.slug })))
    .returning();

  const idPorSlug = new Map(categoriasInsertadas.map((c) => [c.slug, c.id]));

  const subcategoriasInsertadas = await db
    .insert(schema.categorias)
    .values(
      conPadre.map((c) => ({
        nombre: c.nombre,
        slug: c.slug,
        categoriaPadreId: idPorSlug.get(c.categoriaPadreSlug!),
      })),
    )
    .returning();

  for (const c of subcategoriasInsertadas) idPorSlug.set(c.slug, c.id);

  // --- Productos ---
  const productosInsertados = await db
    .insert(schema.productos)
    .values(
      productosSeed.map((p) => ({
        nombre: p.nombre,
        slug: p.slug,
        descripcion: p.descripcion,
        precio: p.precio.toFixed(2),
        precioOferta: p.precioOferta?.toFixed(2),
        costoAdquisicion: p.costoAdquisicion?.toFixed(2),
        stock: p.stock,
        sku: p.sku,
        marca: p.marca,
        categoriaId: idPorSlug.get(p.categoriaSlug),
        pesoKg: p.pesoKg?.toFixed(2),
        altoCm: p.altoCm?.toFixed(2),
        anchoCm: p.anchoCm?.toFixed(2),
        largoCm: p.largoCm?.toFixed(2),
        imagenes: p.imagenes,
        specsJson: p.specsJson,
        garantiaMeses: p.garantiaMeses,
        destacado: p.destacado ?? false,
      })),
    )
    .returning();

  const idPorSku = new Map(productosInsertados.map((p) => [p.sku!, p.id]));

  // --- Variantes ---
  await db.insert(schema.variantesProducto).values(
    variantesSeed.map((v) => ({
      productoId: idPorSku.get(v.productoSku)!,
      atributo: v.atributo,
      valor: v.valor,
      precioExtra: v.precioExtra.toFixed(2),
      stock: v.stock,
    })),
  );

  // --- Tarifas de envío ---
  await db.insert(schema.tarifasEnvio).values(
    tarifasEnvioSeed.map((t) => ({
      departamento: t.departamento,
      costo: t.costo.toFixed(2),
      diasEstimadosMin: t.diasEstimadosMin,
      diasEstimadosMax: t.diasEstimadosMax,
    })),
  );

  // --- Cupones ---
  await db.insert(schema.cupones).values(
    cuponesSeed.map((c) => ({
      codigo: c.codigo,
      tipo: c.tipo,
      valor: c.valor.toFixed(2),
      montoMinimoCompra: c.montoMinimoCompra.toFixed(2),
      fechaInicio: new Date(c.fechaInicio),
      fechaFin: new Date(c.fechaFin),
      usosMaximos: c.usosMaximos,
    })),
  );

  // --- Usuario admin de prueba ---
  const passwordHash = await bcrypt.hash("admin123", 10);
  await db.insert(schema.usuarios).values([
    {
      nombre: "Admin Ecomers",
      email: "admin@ecomers.test",
      passwordHash,
      rol: "admin",
      dni: "12345678",
    },
  ]);

  console.log("Seed completado ✔");
  console.log(`- ${categoriasInsertadas.length + subcategoriasInsertadas.length} categorías`);
  console.log(`- ${productosInsertados.length} productos`);
  console.log("- Usuario admin: admin@ecomers.test / admin123");
}

main()
  .catch((err) => {
    console.error("Error en el seed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
