import { z } from "zod";

/** Una fila del CSV de importación masiva de productos — ver plantilla
 * descargable en el diálogo de importación (/admin/productos). */
export const filaImportacionSchema = z.object({
  sku: z.string().min(1, "SKU requerido"),
  nombre: z.string().min(2, "Nombre requerido"),
  marca: z.string().min(1, "Marca requerida"),
  categoriaSlug: z.string().min(1, "categoriaSlug requerido"),
  precio: z.coerce.number().positive("Precio inválido"),
  precioOferta: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : undefined))
    .refine((v) => v === undefined || v > 0, "Precio de oferta inválido"),
  costoAdquisicion: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : undefined)),
  stock: z.coerce.number().int().min(0, "Stock inválido"),
  garantiaMeses: z.coerce.number().int().min(0).optional().default(12),
  destacado: z
    .string()
    .optional()
    .transform((v) => ["si", "sí", "true", "1"].includes((v ?? "").trim().toLowerCase())),
  descripcion: z.string().optional().default(""),
  // Varias URLs separadas por "|" — el CSV ya usa comas como delimitador de columnas.
  imagenes: z
    .string()
    .optional()
    .transform((v) => (v ? v.split("|").map((s) => s.trim()).filter(Boolean) : [])),
});

export type FilaImportacion = z.input<typeof filaImportacionSchema>;
export type FilaImportacionValidada = z.output<typeof filaImportacionSchema>;

export const COLUMNAS_PLANTILLA = [
  "sku",
  "nombre",
  "marca",
  "categoriaSlug",
  "precio",
  "precioOferta",
  "costoAdquisicion",
  "stock",
  "garantiaMeses",
  "destacado",
  "descripcion",
  "imagenes",
] as const;
