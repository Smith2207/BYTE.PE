/**
 * Fuente única de datos de ejemplo del catálogo (productos ficticios de electrónica).
 * La usan tanto scripts/seed.ts (para poblar Neon/Postgres) como src/lib/mock (para
 * mostrar el diseño funcionando sin base de datos). No depende de Drizzle ni de Next.js.
 */

export type CategoriaSeed = {
  nombre: string;
  slug: string;
  categoriaPadreSlug?: string;
};

export type ProductoSeed = {
  nombre: string;
  slug: string;
  descripcion: string;
  precio: number;
  precioOferta?: number;
  // Costo de adquisición (compra/importación) — solo se ve en el admin,
  // sirve para calcular el margen de ganancia.
  costoAdquisicion?: number;
  stock: number;
  sku: string;
  marca: string;
  categoriaSlug: string;
  pesoKg?: number;
  altoCm?: number;
  anchoCm?: number;
  largoCm?: number;
  imagenes: string[];
  specsJson: Record<string, string>;
  garantiaMeses: number;
  destacado?: boolean;
};

export type VarianteSeed = {
  productoSku: string;
  atributo: string;
  valor: string;
  precioExtra: number;
  stock: number;
};

export type TarifaEnvioSeed = {
  departamento: string;
  costo: number;
  diasEstimadosMin: number;
  diasEstimadosMax: number;
};

export type CuponSeed = {
  codigo: string;
  tipo: "porcentaje" | "monto_fijo" | "envio_gratis";
  valor: number;
  montoMinimoCompra: number;
  fechaInicio: string;
  fechaFin: string;
  usosMaximos: number | null;
};

export const categoriasSeed: CategoriaSeed[] = [
  { nombre: "Laptops", slug: "laptops" },
  { nombre: "Celulares", slug: "celulares" },
  { nombre: "Tablets", slug: "tablets" },
  { nombre: "PCs de Escritorio", slug: "pcs-escritorio" },
  { nombre: "Accesorios", slug: "accesorios" },
  { nombre: "Laptops Gaming", slug: "laptops-gaming", categoriaPadreSlug: "laptops" },
  { nombre: "Ultrabooks", slug: "ultrabooks", categoriaPadreSlug: "laptops" },
  { nombre: "Gama Alta", slug: "celulares-gama-alta", categoriaPadreSlug: "celulares" },
  { nombre: "Gama Media", slug: "celulares-gama-media", categoriaPadreSlug: "celulares" },
  { nombre: "PCs Gaming", slug: "pcs-gaming", categoriaPadreSlug: "pcs-escritorio" },
  { nombre: "Audio", slug: "audio", categoriaPadreSlug: "accesorios" },
  { nombre: "Periféricos", slug: "perifericos", categoriaPadreSlug: "accesorios" },
  { nombre: "Almacenamiento", slug: "almacenamiento", categoriaPadreSlug: "accesorios" },
];

export const productosSeed: ProductoSeed[] = [
  {
    nombre: "Laptop ASUS ROG Strix G16",
    slug: "laptop-asus-rog-strix-g16",
    descripcion:
      "Laptop gamer con procesador Intel Core i7 13na gen, GPU RTX 4060 y pantalla 165Hz para máximo rendimiento.",
    precio: 6499,
    costoAdquisicion: 4550,
    precioOferta: 5899,
    stock: 8,
    sku: "ASUS-ROG-G16",
    marca: "ASUS",
    categoriaSlug: "laptops-gaming",
    pesoKg: 2.5,
    altoCm: 2.6,
    anchoCm: 35.4,
    largoCm: 25.3,
    imagenes: [],
    specsJson: {
      procesador: "Intel Core i7-13650HX",
      ram: "16GB DDR5",
      almacenamiento: "1TB SSD NVMe",
      gpu: "NVIDIA RTX 4060 8GB",
      pantalla: '16" QHD 165Hz',
    },
    garantiaMeses: 12,
    destacado: true,
  },
  {
    nombre: "Laptop Lenovo IdeaPad Slim 5",
    slug: "laptop-lenovo-ideapad-slim-5",
    descripcion: "Ultrabook liviana ideal para trabajo y estudio, batería de larga duración.",
    precio: 2899,
    costoAdquisicion: 2030,
    stock: 15,
    sku: "LEN-IPS5",
    marca: "Lenovo",
    categoriaSlug: "ultrabooks",
    pesoKg: 1.6,
    altoCm: 1.7,
    anchoCm: 32.3,
    largoCm: 21.5,
    imagenes: [],
    specsJson: {
      procesador: "AMD Ryzen 5 7530U",
      ram: "8GB",
      almacenamiento: "512GB SSD",
      pantalla: '14" FHD IPS',
    },
    garantiaMeses: 12,
  },
  {
    nombre: "Laptop HP Pavilion 15",
    slug: "laptop-hp-pavilion-15",
    descripcion: "Equilibrio perfecto entre rendimiento y portabilidad para el día a día.",
    precio: 3299,
    costoAdquisicion: 2310,
    stock: 10,
    sku: "HP-PAV15",
    marca: "HP",
    categoriaSlug: "ultrabooks",
    pesoKg: 1.75,
    imagenes: [],
    specsJson: {
      procesador: "Intel Core i5-1335U",
      ram: "16GB",
      almacenamiento: "512GB SSD",
      pantalla: '15.6" FHD',
    },
    garantiaMeses: 12,
  },
  {
    nombre: "Samsung Galaxy S24 Ultra",
    slug: "samsung-galaxy-s24-ultra",
    descripcion: "Flagship con S Pen integrado, cámara de 200MP y pantalla Dynamic AMOLED 2X.",
    precio: 4599,
    costoAdquisicion: 3220,
    precioOferta: 4199,
    stock: 12,
    sku: "SAM-S24U",
    marca: "Samsung",
    categoriaSlug: "celulares-gama-alta",
    imagenes: [],
    specsJson: {
      pantalla: '6.8" QHD+ 120Hz',
      camara: "200MP + 12MP + 50MP + 10MP",
      bateria: "5000mAh",
      procesador: "Snapdragon 8 Gen 3",
    },
    garantiaMeses: 12,
    destacado: true,
  },
  {
    nombre: "Xiaomi Redmi Note 13 Pro",
    slug: "xiaomi-redmi-note-13-pro",
    descripcion: "Excelente relación precio-calidad con cámara de 200MP y carga rápida 67W.",
    precio: 1299,
    costoAdquisicion: 910,
    stock: 30,
    sku: "XIA-RN13P",
    marca: "Xiaomi",
    categoriaSlug: "celulares-gama-media",
    imagenes: [],
    specsJson: {
      pantalla: '6.67" AMOLED 120Hz',
      camara: "200MP + 8MP + 2MP",
      bateria: "5100mAh",
    },
    garantiaMeses: 12,
  },
  {
    nombre: "iPhone 15",
    slug: "iphone-15",
    descripcion: "Chip A16 Bionic, cámara principal de 48MP y Dynamic Island.",
    precio: 4199,
    costoAdquisicion: 2940,
    stock: 9,
    sku: "APL-IP15",
    marca: "Apple",
    categoriaSlug: "celulares-gama-alta",
    imagenes: [],
    specsJson: { pantalla: '6.1" Super Retina XDR', camara: "48MP + 12MP", bateria: "3349mAh" },
    garantiaMeses: 12,
    destacado: true,
  },
  {
    nombre: "Samsung Galaxy Tab S9",
    slug: "samsung-galaxy-tab-s9",
    descripcion:
      "Tablet premium con S Pen incluido y pantalla Dynamic AMOLED 2X resistente al agua.",
    precio: 3199,
    costoAdquisicion: 2240,
    stock: 7,
    sku: "SAM-TABS9",
    marca: "Samsung",
    categoriaSlug: "tablets",
    imagenes: [],
    specsJson: { pantalla: '11" Dynamic AMOLED 2X', ram: "8GB", almacenamiento: "128GB" },
    garantiaMeses: 12,
  },
  {
    nombre: "PC Gamer TecnoMax Ryzen 5 / RTX 4060",
    slug: "pc-gamer-tecnomax-ryzen5-rtx4060",
    descripcion: "PC de escritorio armada y probada, lista para gaming en 1440p.",
    precio: 5299,
    costoAdquisicion: 3710,
    stock: 5,
    sku: "TM-PC-R5-4060",
    marca: "TecnoMax",
    categoriaSlug: "pcs-gaming",
    imagenes: [],
    specsJson: {
      procesador: "AMD Ryzen 5 7600",
      ram: "16GB DDR5",
      almacenamiento: "1TB SSD NVMe",
      gpu: "RTX 4060 8GB",
      fuente: "650W 80+ Bronze",
    },
    garantiaMeses: 24,
    destacado: true,
  },
  {
    nombre: "Audífonos Sony WH-1000XM5",
    slug: "audifonos-sony-wh-1000xm5",
    descripcion: "Cancelación de ruido líder en la industria, hasta 30 horas de batería.",
    precio: 1399,
    costoAdquisicion: 980,
    stock: 20,
    sku: "SNY-XM5",
    marca: "Sony",
    categoriaSlug: "audio",
    imagenes: [],
    specsJson: { tipo: "Over-ear inalámbrico", bateria: "30 horas", anc: "Sí" },
    garantiaMeses: 12,
  },
  {
    nombre: "Mouse Logitech G Pro X Superlight",
    slug: "mouse-logitech-gprox-superlight",
    descripcion: "Mouse gamer inalámbrico ultraligero de 63 gramos, sensor HERO 25K.",
    precio: 449,
    costoAdquisicion: 310,
    stock: 25,
    sku: "LOG-GPROX",
    marca: "Logitech",
    categoriaSlug: "perifericos",
    imagenes: [],
    specsJson: { peso: "63g", sensor: "HERO 25K", conexion: "Inalámbrico LIGHTSPEED" },
    garantiaMeses: 24,
  },
  {
    nombre: "Teclado Mecánico Redragon Kumara K552",
    slug: "teclado-redragon-kumara-k552",
    descripcion: "Teclado mecánico compacto TKL con switches azules y retroiluminación RGB.",
    precio: 179,
    costoAdquisicion: 115,
    stock: 40,
    sku: "RDG-K552",
    marca: "Redragon",
    categoriaSlug: "perifericos",
    imagenes: [],
    specsJson: { switches: "Blue mecánico", formato: "TKL", retroiluminacion: "RGB" },
    garantiaMeses: 6,
  },
  {
    nombre: "SSD Kingston NV2 1TB NVMe",
    slug: "ssd-kingston-nv2-1tb",
    descripcion: "Unidad de estado sólido NVMe PCIe 4.0 con velocidades de hasta 3500MB/s.",
    precio: 259,
    costoAdquisicion: 170,
    stock: 3,
    sku: "KING-NV2-1TB",
    marca: "Kingston",
    categoriaSlug: "almacenamiento",
    imagenes: [],
    specsJson: { capacidad: "1TB", interfaz: "PCIe 4.0 NVMe", velocidadLectura: "3500MB/s" },
    garantiaMeses: 36,
  },
  {
    // Stock 0 a propósito: producto de ejemplo para probar el flujo de
    // "agotado" / "avísame cuando vuelva".
    nombre: "Disco Duro Externo Seagate 2TB",
    slug: "disco-duro-externo-seagate-2tb",
    descripcion: "Almacenamiento portátil USB 3.0 compatible con Windows y Mac.",
    precio: 349,
    costoAdquisicion: 230,
    stock: 0,
    sku: "SEA-EXT-2TB",
    marca: "Seagate",
    categoriaSlug: "almacenamiento",
    imagenes: [],
    specsJson: { capacidad: "2TB", interfaz: "USB 3.0" },
    garantiaMeses: 24,
  },
];

export const variantesSeed: VarianteSeed[] = [
  { productoSku: "ASUS-ROG-G16", atributo: "almacenamiento", valor: "1TB SSD", precioExtra: 0, stock: 5 },
  { productoSku: "ASUS-ROG-G16", atributo: "almacenamiento", valor: "2TB SSD", precioExtra: 450, stock: 3 },
  { productoSku: "SAM-S24U", atributo: "color", valor: "Negro Titanio", precioExtra: 0, stock: 6 },
  { productoSku: "SAM-S24U", atributo: "color", valor: "Gris Titanio", precioExtra: 0, stock: 6 },
  { productoSku: "XIA-RN13P", atributo: "almacenamiento", valor: "128GB", precioExtra: 0, stock: 18 },
  { productoSku: "XIA-RN13P", atributo: "almacenamiento", valor: "256GB", precioExtra: 150, stock: 12 },
];

export const tarifasEnvioSeed: TarifaEnvioSeed[] = [
  { departamento: "Lima", costo: 15, diasEstimadosMin: 1, diasEstimadosMax: 2 },
  { departamento: "Callao", costo: 15, diasEstimadosMin: 1, diasEstimadosMax: 2 },
  { departamento: "Arequipa", costo: 25, diasEstimadosMin: 2, diasEstimadosMax: 4 },
  { departamento: "La Libertad", costo: 25, diasEstimadosMin: 2, diasEstimadosMax: 4 },
  { departamento: "Cusco", costo: 30, diasEstimadosMin: 3, diasEstimadosMax: 5 },
  { departamento: "Puno", costo: 35, diasEstimadosMin: 4, diasEstimadosMax: 7 },
  { departamento: "Loreto", costo: 45, diasEstimadosMin: 5, diasEstimadosMax: 9 },
  { departamento: "Otros", costo: 30, diasEstimadosMin: 3, diasEstimadosMax: 6 },
];

export const cuponesSeed: CuponSeed[] = [
  {
    codigo: "BIENVENIDO10",
    tipo: "porcentaje",
    valor: 10,
    montoMinimoCompra: 100,
    fechaInicio: "2026-01-01",
    fechaFin: "2026-12-31",
    usosMaximos: 500,
  },
  {
    codigo: "ENVIOGRATIS",
    tipo: "envio_gratis",
    valor: 0,
    montoMinimoCompra: 300,
    fechaInicio: "2026-01-01",
    fechaFin: "2026-12-31",
    usosMaximos: null,
  },
];
