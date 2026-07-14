import { z } from "zod";

// DNI: 8 dígitos. RUC: 11 dígitos, empieza con 10/15/17/20. Solo estos
// dos tipos de documento en el checkout (sin CE ni Pasaporte).
export const documentoSchema = z
  .object({
    tipoDocumento: z.enum(["dni", "ruc"]),
    numeroDocumento: z.string().min(1, "Ingresa tu número de documento"),
  })
  .superRefine((data, ctx) => {
    const { tipoDocumento, numeroDocumento } = data;
    if (tipoDocumento === "dni" && !/^\d{8}$/.test(numeroDocumento)) {
      ctx.addIssue({
        code: "custom",
        path: ["numeroDocumento"],
        message: "El DNI debe tener 8 dígitos",
      });
    }
    if (tipoDocumento === "ruc" && !/^(10|15|17|20)\d{9}$/.test(numeroDocumento)) {
      ctx.addIssue({
        code: "custom",
        path: ["numeroDocumento"],
        message: "El RUC debe tener 11 dígitos y empezar con 10, 15, 17 o 20",
      });
    }
  });

// No hacemos despacho a domicilio por el momento (el envío es por
// agencia) — la dirección exacta queda como referencia opcional; solo
// departamento/provincia/distrito son obligatorios para calcular la
// tarifa y coordinar el recojo/envío por agencia.
export const direccionSchema = z.object({
  departamento: z.string().min(1, "Selecciona un departamento"),
  provincia: z.string().min(1, "Selecciona una provincia"),
  distrito: z.string().min(1, "Selecciona un distrito"),
  direccionExacta: z.string().optional(),
  referencia: z.string().optional(),
});

export const facturacionSchema = z.object({
  tipoDocumento: z.enum(["dni", "ruc"]),
  numeroDocumento: z.string().min(1),
  nombreComprador: z.string().min(2, "Ingresa tu nombre completo"),
  telefonoComprador: z.string().min(6, "Ingresa un teléfono válido"),
  emailComprador: z.string().email("Ingresa un correo válido"),
  requiereFactura: z.boolean(),
  ruc: z.string().optional(),
  razonSocial: z.string().optional(),
});

export const checkoutSchema = z.object({
  direccion: direccionSchema,
  facturacion: facturacionSchema,
  metodoPago: z.enum(["tarjeta", "yape", "plin", "transferencia", "contra_entrega"]),
  cuponCodigo: z.string().optional(),
});

export type DireccionInput = z.infer<typeof direccionSchema>;
export type FacturacionInput = z.infer<typeof facturacionSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
