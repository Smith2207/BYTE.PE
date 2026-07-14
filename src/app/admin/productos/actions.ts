"use server";

import { revalidatePath } from "next/cache";
import {
  adminCrearProducto,
  adminActualizarProducto,
  adminEliminarProducto,
  adminListarProductos,
  adminListarCategorias,
  type ProductoFormInput,
} from "@/lib/mock/repo";
import { filaImportacionSchema, type FilaImportacion } from "@/lib/validations/importar-productos";

export async function crearProductoAction(input: ProductoFormInput) {
  const producto = await adminCrearProducto(input);
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  return producto;
}

export async function actualizarProductoAction(id: string, input: Partial<ProductoFormInput>) {
  const producto = await adminActualizarProducto(id, input);
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  revalidatePath(`/productos/${producto.slug}`);
  return producto;
}

export async function eliminarProductoAction(id: string) {
  await adminEliminarProducto(id);
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
}

export async function importarProductosAction(filas: FilaImportacion[]) {
  const [categorias, productosExistentes] = await Promise.all([
    adminListarCategorias(),
    adminListarProductos(),
  ]);
  const categoriaPorSlug = new Map(categorias.map((c) => [c.slug, c.id]));
  const skusExistentes = new Set(productosExistentes.map((p) => p.sku.toLowerCase()));
  const skusEnEsteLote = new Set<string>();

  const errores: { fila: number; mensaje: string }[] = [];
  let creados = 0;

  for (let i = 0; i < filas.length; i++) {
    const numeroFila = i + 2; // +1 por índice base 1, +1 por la fila de encabezado
    const resultado = filaImportacionSchema.safeParse(filas[i]);
    if (!resultado.success) {
      errores.push({ fila: numeroFila, mensaje: resultado.error.issues[0].message });
      continue;
    }
    const datos = resultado.data;
    const skuNormalizado = datos.sku.toLowerCase();

    const categoriaId = categoriaPorSlug.get(datos.categoriaSlug);
    if (!categoriaId) {
      errores.push({ fila: numeroFila, mensaje: `categoriaSlug "${datos.categoriaSlug}" no existe` });
      continue;
    }
    if (skusExistentes.has(skuNormalizado) || skusEnEsteLote.has(skuNormalizado)) {
      errores.push({ fila: numeroFila, mensaje: `SKU "${datos.sku}" ya existe` });
      continue;
    }

    const input: ProductoFormInput = {
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      precio: datos.precio,
      precioOferta: datos.precioOferta ?? null,
      costoAdquisicion: datos.costoAdquisicion ?? null,
      stock: datos.stock,
      sku: datos.sku,
      marca: datos.marca,
      categoriaId,
      pesoKg: null,
      imagenes: datos.imagenes,
      specsJson: {},
      garantiaMeses: datos.garantiaMeses,
      destacado: datos.destacado,
    };

    try {
      await adminCrearProducto(input);
      skusEnEsteLote.add(skuNormalizado);
      creados++;
    } catch (err) {
      errores.push({
        fila: numeroFila,
        mensaje: err instanceof Error ? err.message : "No se pudo crear el producto",
      });
    }
  }

  if (creados > 0) {
    revalidatePath("/admin/productos");
    revalidatePath("/productos");
  }

  return { creados, errores };
}
