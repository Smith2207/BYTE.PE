import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { detectarTipoImagen } from "@/lib/validar-imagen";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

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
  if (archivo.size > MAX_BYTES) {
    return NextResponse.json({ error: "La imagen no puede pesar más de 5MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await archivo.arrayBuffer());
  const tipo = detectarTipoImagen(buffer);
  if (!tipo) {
    return NextResponse.json(
      { error: "Solo se permiten imágenes JPG, PNG, GIF o WEBP" },
      { status: 400 },
    );
  }

  const nombreArchivo = `${randomUUID()}.${tipo.ext}`;

  // Vercel Blob: almacenamiento real, persiste entre despliegues. Sin el
  // token (solo en desarrollo local) cae a disco para poder trabajar sin
  // configurar nada — en producción sin token, falla explícito en vez de
  // guardar en un filesystem efímero que se perdería igual.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`productos/${nombreArchivo}`, buffer, {
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

  const directorio = path.join(process.cwd(), "public", "uploads", "productos");
  await mkdir(directorio, { recursive: true });
  await writeFile(path.join(directorio, nombreArchivo), buffer);
  console.warn(
    "[upload] BLOB_READ_WRITE_TOKEN no configurado — guardando en disco local (solo dev). " +
      "Esto NO persiste en producción, configura Vercel Blob antes de desplegar.",
  );

  return NextResponse.json({ url: `/uploads/productos/${nombreArchivo}` });
}
