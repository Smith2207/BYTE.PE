"use server";

import { revalidatePath } from "next/cache";
import {
  adminCrearProducto,
  adminActualizarProducto,
  adminEliminarProducto,
  adminListarProductos,
  adminListarCategorias,
  adminObtenerProducto,
  marcarVideoGenerando,
  guardarResultadoVideo,
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

/** Dispara el render de un video corto del producto en services/video-render
 * (Render) — solo manda la señal y espera la confirmación de que el
 * servicio la recibió (202); el render en sí es asíncrono y su resultado
 * llega después por /api/webhooks/video-producto. */
export async function generarVideoProductoAction(id: string) {
  const producto = await adminObtenerProducto(id);
  if (!producto) throw new Error("Producto no encontrado");

  await marcarVideoGenerando(id);
  revalidatePath("/admin/productos");

  const serviceUrl = process.env.VIDEO_RENDER_SERVICE_URL;
  const secret = process.env.VIDEO_RENDER_SHARED_SECRET;
  if (!serviceUrl || !secret) {
    await guardarResultadoVideo(id, {
      error: "Falta configurar VIDEO_RENDER_SERVICE_URL/VIDEO_RENDER_SHARED_SECRET",
    });
    revalidatePath("/admin/productos");
    throw new Error("El servicio de video aún no está configurado (ver .env.example).");
  }

  try {
    const res = await fetch(`${serviceUrl.replace(/\/$/, "")}/render`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-render-secret": secret },
      body: JSON.stringify({
        productoId: producto.id,
        nombre: producto.nombre,
        marca: producto.marca,
        precio: producto.precioOferta ?? producto.precio,
        imagenes: producto.imagenes,
        specsJson: producto.specsJson,
      }),
    });
    if (!res.ok) {
      const detalle = await res.text().catch(() => "");
      await guardarResultadoVideo(id, {
        error: `El servicio de render respondió ${res.status}${detalle ? `: ${detalle}` : ""}`,
      });
      revalidatePath("/admin/productos");
      throw new Error("El servicio de render rechazó la solicitud.");
    }
  } catch (err) {
    if (err instanceof Error && err.message === "El servicio de render rechazó la solicitud.") {
      throw err;
    }
    await guardarResultadoVideo(id, {
      error: err instanceof Error ? err.message : "No se pudo contactar el servicio de render",
    });
    revalidatePath("/admin/productos");
    throw new Error("No se pudo contactar el servicio de render.");
  }

  revalidatePath("/admin/productos");
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
