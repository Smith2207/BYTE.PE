# BYTE.PE

Ecommerce completo de electrónica y tecnología para Perú — laptops, celulares, tablets, PCs gamer y accesorios.

**En vivo:** https://byte-pe.vercel.app

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Estilos / UI | Tailwind CSS + shadcn/ui (Radix) |
| Animaciones | GSAP + ScrollTrigger |
| Base de datos | Neon Postgres vía Drizzle ORM |
| Autenticación | NextAuth (Auth.js) — credenciales + Google OAuth |
| Imágenes | Vercel Blob |
| Pagos | Mercado Pago (Checkout Pro) — Yape/Plin/transferencia/contra entrega |
| Correo | Gmail SMTP (nodemailer) |
| Documentos | apiperu.dev (autocompletado DNI/RUC) |
| Hosting | Vercel |

---

## Funcionalidad

### Tienda (cliente)

- Catálogo con categorías/subcategorías, filtros, búsqueda y variantes de producto (color, almacenamiento, etc.)
- Página de producto con hero cinematográfico, galería con zoom y animaciones GSAP
- Carrito y checkout multi-paso:
  - Dirección con **ubigeo real en cascada** (departamento → provincia → distrito, dataset oficial INEI/RENIEC)
  - Envío por agencia (Olva/Shalom) con tarifa fija por departamento — no hay despacho a domicilio, la dirección exacta es solo referencial
  - Cupones de descuento
  - **Precios ya incluyen IGV** — el total mostrado nunca sube en el checkout, cumple la normativa peruana de protección al consumidor (precio anunciado = precio final)
  - Autocompletado real de DNI/RUC (apiperu.dev)
  - Pago con Yape/Plin/transferencia/contra entrega, o tarjeta vía Mercado Pago
- Cuenta de usuario: direcciones guardadas, historial de pedidos, lista de deseos, reseñas de producto
- Boleta/factura imprimible (comprobante simulado, no homologado por SUNAT — proyecto en fase de prueba)
- Correos automáticos: confirmación de pedido al comprador + aviso de nuevo pedido a soporte
- Login con correo/contraseña o Google
- Libro de Reclamaciones virtual + Términos y Condiciones, Política de Privacidad, Cambios y Devoluciones (requisitos legales para ecommerce en Perú)

### Panel admin (`/admin`, solo rol `admin`)

- CRUD de productos y categorías, con subida real de imágenes
- Gestión de cupones
- Pedidos: cambio de estado, courier/tracking, ver comprobante
- **Compras a proveedores** (Amazon, eBay u otro): registra la compra, y al marcar **"recibido"**:
  - si el producto ya existe en el catálogo, suma stock y recalcula el costo de adquisición por **promedio ponderado**
  - si es un producto nuevo, se **crea y publica automáticamente** en la tienda
- Dashboard con ventas, margen bruto estimado, gráficos de ventas/productos más vendidos y alertas de stock bajo/agotado

---

## Arquitectura y decisiones relevantes

- **Precios tax-inclusive**: `producto.precio` ya incluye IGV. El checkout nunca suma un 18% adicional — lo descompone (`desglosarIGV` en `src/lib/format.ts`) solo para mostrar "Op. gravada" / "IGV" en el comprobante. El total pagado siempre es igual al precio mostrado en el catálogo + envío.
- **Transacciones reales**: la confirmación de un pedido (verificar stock → descontar → aplicar cupón → guardar pedido) corre dentro de una única `db.transaction()` — si algo falla, nada queda a medias.
- **Todas las integraciones externas degradan con gracia**: si falta un token (Mercado Pago, apiperu.dev, Google, Blob, email), la función correspondiente devuelve `null`/no hace nada — nunca bloquea una compra. En producción, la única excepción es la subida de imágenes sin `BLOB_READ_WRITE_TOKEN`, que falla explícito en vez de escribir a un filesystem efímero que se perdería igual.
- **NextAuth con config dividida**: `auth.config.ts` (Edge-safe, sin providers, usado por el middleware) + `auth.ts` (config completa con Credentials/Google, runtime Node.js).

---

## Variables de entorno

Copiar `.env.example` a `.env.local` y completar. Todas son opcionales excepto `DATABASE_URL`, `AUTH_SECRET` y `NEXTAUTH_URL` — sin las demás, esa función específica queda desactivada sin romper el resto del sitio.

| Variable | Para qué | Dónde conseguirla |
|---|---|---|
| `DATABASE_URL` | Base de datos | [neon.tech](https://neon.tech) |
| `AUTH_SECRET` | Firma de sesión | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL del sitio | tu dominio (o `http://localhost:3000` en local) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Login con Google | [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials) |
| `MERCADOPAGO_ACCESS_TOKEN` / `MERCADOPAGO_PUBLIC_KEY` | Pago con tarjeta | [mercadopago.com.pe/developers](https://www.mercadopago.com.pe/developers/panel) (credenciales de prueba) |
| `APIPERU_TOKEN` | Autocompletar DNI/RUC | [apiperu.dev](https://apiperu.dev) (gratis, 100/mes) |
| `BLOB_READ_WRITE_TOKEN` | Subida de imágenes | Vercel Dashboard → Storage → Blob |
| `EMAIL_USER` / `EMAIL_APP_PASSWORD` | Envío de correos | [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) (contraseña de aplicación, no la normal) |

---

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # completar valores
npm run db:push               # aplicar el schema a la base de datos
npm run db:seed               # poblar categorías/productos de ejemplo + usuario admin
npm run dev
```

Usuario admin de prueba tras el seed: `admin@ecomers.test` / `admin123`.

---

## Pendiente

- **Mercado Pago**: código listo, falta configurar credenciales reales
- SEO de lanzamiento (sitemap.xml, robots.txt, datos estructurados JSON-LD)
- Tests automatizados (hoy la verificación es manual en cada cambio)
- Auditoría completa de un bug ya corregido parcialmente: algunas clases `bg-x/NN` de Tailwind no generan CSS cuando el color base es una variable `oklch()` — se corrigió en los 3 casos detectados (navbar, wishlist, uploader admin), pero podría haber más sin detectar
