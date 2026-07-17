import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { detectarTipoArchivo } from "@/lib/validar-imagen";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB — capturas de pantalla o PDF de voucher

/**
 * Subida de comprobante de pago (Yape/Prex/transferencia) desde el
 * checkout — a diferencia de /api/admin/upload, cualquier cliente
 * autenticado puede usarlo (no solo admin), pero solo escribe en la
 * carpeta "comprobantes-pago", nunca en "productos".
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const formData = await req.formData();
  const archivo = formData.get("archivo");
  if (!(archivo instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });
  }

  if (archivo.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `El archivo no puede pesar más de ${MAX_BYTES / (1024 * 1024)}MB` },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await archivo.arrayBuffer());
  const tipo = detectarTipoArchivo(buffer);
  if (!tipo) {
    return NextResponse.json(
      { error: "Solo se permiten PDF o imágenes JPG, PNG, GIF o WEBP" },
      { status: 400 },
    );
  }

  const nombreArchivo = `${randomUUID()}.${tipo.ext}`;
  const carpeta = "comprobantes-pago";

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`${carpeta}/${nombreArchivo}`, buffer, {
      access: "public",
      contentType: tipo.mime,
    });
    return NextResponse.json({ url: blob.url });
  }

  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Almacenamiento de archivos no configurado (falta BLOB_READ_WRITE_TOKEN)." },
      { status: 500 },
    );
  }

  const directorio = path.join(process.cwd(), "public", "uploads", carpeta);
  await mkdir(directorio, { recursive: true });
  await writeFile(path.join(directorio, nombreArchivo), buffer);
  console.warn(
    "[upload comprobante] BLOB_READ_WRITE_TOKEN no configurado — guardando en disco local (solo dev).",
  );

  return NextResponse.json({ url: `/uploads/${carpeta}/${nombreArchivo}` });
}
