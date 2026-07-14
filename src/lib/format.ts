const formatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

export function formatoPEN(valor: number) {
  return formatter.format(valor);
}

/**
 * Arma el texto de una dirección omitiendo la dirección exacta cuando no
 * se indicó (es opcional — no hacemos despacho a domicilio, el envío es
 * por agencia y esta línea solo sirve como referencia).
 */
export function formatoDireccion(direccion: {
  direccionExacta?: string | null;
  distrito: string;
  provincia: string;
  departamento: string;
}) {
  return [direccion.direccionExacta, direccion.distrito, direccion.provincia, direccion.departamento]
    .filter(Boolean)
    .join(", ");
}
