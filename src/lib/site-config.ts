export const siteConfig = {
  nombre: "BYTE.PE",
  descripcion:
    "Electrónica, gaming y tecnología en Perú: laptops, celulares, tablets, PCs y accesorios.",
  // Placeholder — reemplazar por el número real de atención antes de producción.
  whatsapp: "51999999999",
  email: "hola@byte.pe",
  // Interruptor único: envío gratis en todo el sitio, sin monto mínimo. La
  // tienda absorbe el costo real del courier (ver costoEnvioReal en pedidos)
  // — apagar esto vuelve a cobrar la tarifa real de cada courier.
  envioGratis: true,
};

export const categoriasNav = [
  { nombre: "Laptops", slug: "laptops" },
  { nombre: "Celulares", slug: "celulares" },
  { nombre: "Tablets", slug: "tablets" },
  { nombre: "PCs de Escritorio", slug: "pcs-escritorio" },
  { nombre: "Accesorios", slug: "accesorios" },
];

export const footerLegalLinks = [
  { nombre: "Libro de Reclamaciones", href: "/libro-de-reclamaciones" },
  { nombre: "Términos y Condiciones", href: "/terminos-y-condiciones" },
  { nombre: "Política de Privacidad", href: "/privacidad" },
  { nombre: "Cambios y Devoluciones", href: "/cambios-y-devoluciones" },
];

// Pago manual mientras no hay pasarela con RUC (Culqi, etc.) — se muestra
// directo en el paso de "Método de pago" del checkout en vez de "te lo
// enviaremos". El QR de Yape sirve también para Plin por la interoperabilidad
// de billeteras digitales vigente en Perú desde 2023, así que un solo QR
// cubre ambas apps.
export const datosPago = {
  yape: {
    qr: "/pago/qr-yape.jpeg",
    titular: "Branly Smith Paucar Arias",
  },
  prex: {
    qr: "/pago/qr-prex.png",
    titular: "Branly Smith Paucar Arias",
  },
  interbank: {
    banco: "Interbank",
    tipoCuenta: "Cuenta Simple Soles",
    numeroCuenta: "8983378472115",
    cci: "00389801337847211540",
    titular: "BRANLY SMITH PAUCAR ARIAS",
  },
};
