import { z } from "zod";

export const reclamoSchema = z.object({
  tipo: z.enum(["reclamo", "queja"]),
  tipoDocumento: z.enum(["dni", "ruc", "ce", "pasaporte"]),
  numeroDocumento: z.string().min(6, "Ingresa un número de documento válido").max(20),
  nombre: z.string().min(2, "Ingresa tu nombre"),
  apellidos: z.string().optional(),
  domicilio: z.string().optional(),
  telefono: z.string().min(6, "Ingresa un teléfono válido"),
  email: z.string().email("Ingresa un correo válido"),
  esMenorEdad: z.boolean(),
  tipoBien: z.enum(["producto", "servicio"]),
  // Se recibe como string desde el input y se convierte a número recién en
  // el server action, para no mezclar tipos de entrada/salida del schema.
  montoReclamado: z.string().optional(),
  descripcionBien: z.string().min(3, "Describe brevemente el producto o servicio"),
  detalleReclamo: z
    .string()
    .min(20, "Describe el reclamo con al menos 20 caracteres para poder atenderlo bien"),
});

export type ReclamoInput = z.infer<typeof reclamoSchema>;
