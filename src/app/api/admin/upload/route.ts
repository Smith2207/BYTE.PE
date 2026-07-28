import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { detectarTipoImagen, detectarTipoArchivo } from "@/lib/validar-imagen";
import { normalizarFotoProducto } from "@/lib/imagenes/normalizar-foto-producto";

const MAX_BYTES_IMAGEN = 5 * 1024 * 1024; // 5MB
const MAX_BYTES_DOCUMENTO = 10 * 1024 * 1024; // 10MB — para PDFs de factura/voucher

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.rol !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const formData = await req.formData();
  const archivo = formData.get("archivo");
  if (!(archivo instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });
  }

  // "documento": además de imágenes, acepta PDF — para comprobantes de
  // compra. Por defecto solo imágenes (fotos de producto, etc).
  const aceptaDocumentos = formData.get("tipo") === "documento";
  const carpeta = aceptaDocumentos ? "comprobantes" : "productos";
  const maxBytes = aceptaDocumentos ? MAX_BYTES_DOCUMENTO : MAX_BYTES_IMAGEN;

  if (archivo.size > maxBytes) {
    return NextResponse.json(
      { error: `El archivo no puede pesar más de ${maxBytes / (1024 * 1024)}MB` },
      { status: 400 },
    );
  }

  const bufferOriginal = Buffer.from(await archivo.arrayBuffer());
  const tipoOriginal = aceptaDocumentos ? detectarTipoArchivo(bufferOriginal) : detectarTipoImagen(bufferOriginal);
  if (!tipoOriginal) {
    return NextResponse.json(
      {
        error: aceptaDocumentos
          ? "Solo se permiten PDF o imágenes JPG, PNG, GIF o WEBP"
          : "Solo se permiten imágenes JPG, PNG, GIF o WEBP",
      },
      { status: 400 },
    );
  }

  // Fotos de producto (no comprobantes, que son documentos de respaldo y
  // deben quedar tal cual se subieron): se normalizan a un cuadrado con
  // fondo blanco consistente, para que no se note en el catálogo qué
  // fotos vinieron prolijas y cuáles tal cual de la publicación del
  // proveedor. Si por lo que sea sharp no puede procesar el archivo (uno
  // corrupto, un GIF animado poco común, etc.), se sube el original en
  // vez de bloquear la subida — mejor una foto sin normalizar que
  // ninguna foto.
  let buffer: Buffer = bufferOriginal;
  let tipo = tipoOriginal;
  if (!aceptaDocumentos) {
    try {
      buffer = await normalizarFotoProducto(bufferOriginal);
      tipo = { ext: "webp", mime: "image/webp" };
    } catch (error) {
      console.error("[upload] No se pudo normalizar la imagen, se sube el original:", error);
    }
  }

  const nombreArchivo = `${randomUUID()}.${tipo.ext}`;

  // Vercel Blob: almacenamiento real, persiste entre despliegues. Sin el
  // token (solo en desarrollo local) cae a disco para poder trabajar sin
  // configurar nada — en producción sin token, falla explícito en vez de
  // guardar en un filesystem efímero que se perdería igual.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`${carpeta}/${nombreArchivo}`, buffer, {
      access: "public",
      contentType: tipo.mime,
    });
    return NextResponse.json({ url: blob.url });
  }

  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Almacenamiento de imágenes no configurado (falta BLOB_READ_WRITE_TOKEN)." },
      { status: 500 },
    );
  }

  const directorio = path.join(process.cwd(), "public", "uploads", carpeta);
  await mkdir(directorio, { recursive: true });
  await writeFile(path.join(directorio, nombreArchivo), buffer);
  console.warn(
    "[upload] BLOB_READ_WRITE_TOKEN no configurado — guardando en disco local (solo dev). " +
      "Esto NO persiste en producción, configura Vercel Blob antes de desplegar.",
  );

  return NextResponse.json({ url: `/uploads/${carpeta}/${nombreArchivo}` });
}
