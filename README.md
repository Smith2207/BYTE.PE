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
- **Opacidad de color con tokens `oklch()`**: los tokens de tema (`--primary`, `--accent`, etc. en `globals.css`) guardan un `oklch(...)` completo, no canales sueltos, así que el patrón clásico de shadcn (`hsl(var(--x) / <alpha-value>)`) no aplica. `tailwind.config.ts` envuelve cada token con sintaxis de color relativo de CSS (`oklch(from var(--x) l c h / <alpha-value>)`), que sí puede tomar ese `oklch(...)` completo y solo pisarle el alfa — así clases como `bg-primary/10` generan CSS real en vez de desaparecer en silencio.
- **Stock reservado vs. liberado**: cancelar un pedido (webhook de Mercado Pago, fallo al generar el link de pago, o el admin a mano) repone el stock automáticamente, y reactivar uno cancelado lo vuelve a descontar — `actualizarEstadoPedido` en `src/lib/pedidos/store.ts` mueve el stock cada vez que el pedido cruza entre un estado "reservado" (pendiente...entregado) y uno "liberado" (cancelado/reembolsado), sin importar por qué camino se llegó ahí.
- **Reseñas moderadas**: quedan `pendiente` hasta que un admin las aprueba en `/admin/resenas` (nunca se publican solas), se marca si el autor tiene una compra real del producto, y solo se permite una reseña por usuario y producto.
- **Rate limiting sin Redis**: login, registro y "olvidé mi contraseña" están protegidos contra fuerza bruta/spam con una tabla propia en Postgres (`intentos_seguridad`, ver `src/lib/seguridad/rate-limit.ts`) en vez de un servicio externo — el volumen de auth de esta tienda no lo justifica y ya hay Postgres a mano.
- **`/pedido/[numero]` no confía en el número de pedido para dar acceso**: `numeroPedido` es un correlativo simple y adivinable (`ORD-2026000001`, `...002`...), así que por sí solo nunca alcanza para ver los datos personales de un pedido. El acceso real lo da `tokenAcceso` (32 bytes aleatorios generados al crear el pedido, ver `puedeVerPedido` en `src/lib/pedidos/store.ts`): admin siempre puede, el dueño de la cuenta logueado puede sin token, y el checkout de invitado usa el token que viaja en el link del correo de confirmación y en la vuelta de Mercado Pago.
- **Stock y cupones con límite de usos se actualizan con `UPDATE ... WHERE` condicional, no "leer y luego escribir"**: dos compras simultáneas del último producto disponible (o del último uso de un cupón limitado) podrían pasar ambas una validación hecha en dos pasos separados. `decrementarStock` (`src/lib/mock/repo.ts`) e `incrementarUso` (`src/lib/cupones/store.ts`) hacen el chequeo y la escritura en el mismo `UPDATE`, así que Postgres serializa la carrera en vez de dejar pasar a los dos.
- **Derechos ARCO (Ley de Protección de Datos Personales, Perú)**: desde `/cuenta` cualquier usuario puede descargar un JSON con todo lo que la tienda tiene de él (perfil, direcciones, pedidos, wishlist, reseñas) o eliminar su cuenta. Al eliminarla, los pedidos NO se borran (son comprobantes de compra, hay que conservarlos) — se desvinculan de la cuenta, y ya tenían su propia copia de los datos de facturación desde el momento de la compra.
- **Sin Sentry ni analytics por defecto**: no hay forma de verificar credenciales de un servicio externo en este entorno, así que en vez de dejar una integración a medias se armó una alerta por correo (`notificarErrorCritico` en `src/lib/monitoreo/notificar-error.ts`, reusa `EMAIL_USER`) para los puntos más caros de fallar en silencio (webhook de pagos, errores no atrapados). Analytics usa Google Analytics 4 vía `@next/third-parties`, con aviso de cookies — ninguno de los dos carga nada si no hay credenciales configuradas.
- **Cambiar la contraseña invalida las sesiones activas**: `usuarios.sessionVersion` se incrementa en cada reset de contraseña; el JWT guarda la versión vigente al momento de iniciar sesión, y el callback `jwt` en `src/auth.ts` la compara en cada request — si no coincide, la sesión se trata como cerrada aunque el token no haya expirado (dispositivo robado, etc.).
- **2FA (TOTP) opcional por usuario**: activable desde `/cuenta` (secreto + QR generados con `otpauth`/`qrcode`, nunca se guarda hasta confirmar un código válido). Solo protege el login por credenciales (email/contraseña) — el de Google no pasa por `authorize`, así que no pide el segundo factor.
- **Verificación de correo no bloqueante**: al registrarse se manda un link de confirmación, pero no verificarlo no impide comprar ni iniciar sesión — solo se muestra un aviso en `/cuenta` con opción de reenviar. Las cuentas de Google se marcan verificadas de entrada (Google ya lo confirmó).
- **Búsqueda insensible a tildes sin la extensión `unaccent`**: `translate()` (función nativa de Postgres) quita los acentos más comunes del español de la columna y del término de búsqueda antes de compararlos con `ilike`, para no depender de que Neon tenga esa extensión habilitada.
- **Bitácora de auditoría** (`/admin/bitacora`): registra quién cambió el estado de un pedido, eliminó un producto, moderó una reseña o resolvió una devolución/reembolso — no instrumenta cada clic del panel, solo las acciones que mueven plata o borran algo.

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
| `EMAIL_USER` / `EMAIL_APP_PASSWORD` | Envío de correos + alertas de error al admin | [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) (contraseña de aplicación, no la normal) |
| `CRON_SECRET` | Autenticar los cron jobs | `openssl rand -base64 32` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 | [analytics.google.com](https://analytics.google.com) — sin esto no se carga ningún script de analítica ni se muestra el aviso de cookies |

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
- Tests automatizados: hay cobertura unitaria de la lógica de negocio pura (cupones, desglose de
  IGV, costeo por promedio ponderado, política de contraseña) con `npm test` — falta cobertura de
  integración/e2e de los flujos completos (checkout, webhooks)
