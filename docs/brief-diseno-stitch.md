# BYTE.PE — Brief de diseño (estado actual del sistema)

Documento generado para alimentar una herramienta de diseño (Google Stitch u otra) y pedir ayuda a mejorar la apariencia visual. Describe el estado real del producto tal como está construido hoy — no son objetivos ni requerimientos, es una foto del "as-is".

## 1. Qué es el producto

**BYTE.PE** — ecommerce de electrónica, gaming y tecnología enfocado en Perú (laptops, celulares, tablets, PCs, accesorios). Parte del catálogo se abastece importando de Amazon/eBay (EE.UU.) y trayendo a Perú vía courier/almacén, o comprando directo a proveedores locales.

Tiene dos "caras":

- **Tienda pública** — catálogo, carrito, checkout, cuenta de cliente.
- **Panel admin** — gestión de productos, compras/importaciones, pedidos, cupones, devoluciones, reclamos, gastos y kardex. Es interno, protegido por rol, nunca lo ve un cliente.

## 2. Stack técnico (relevante para el diseño)

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Componentes base: **shadcn/ui** (Radix UI) — sin personalizar mucho más allá de la paleta de colores
- Animación/interacción: GSAP, con unos pocos componentes propios reutilizables:
  - `RevealOnScroll` — fade/slide al entrar en viewport
  - `Magnetic` — botones que "siguen" ligeramente al cursor
  - `SpotlightCard` — efecto de brillo que sigue el mouse sobre una card
  - `CinematicBackdrop` — fondo decorativo animado (usado en el hero)
- Transiciones de página nativas (View Transitions API) entre grilla de productos y detalle de producto

## 3. Sistema de diseño actual

### Paleta

Minimalista: escala de grises neutra (sin tinte de color en fondo ni texto) + **un solo color de acento (azul)**, estilo Apple. Dark mode es el default de la marca (no solo un toggle secundario).

**Modo claro:**

| Token                                  | Valor (OKLCH)            | Uso                                       |
| -------------------------------------- | ------------------------ | ----------------------------------------- |
| `background`                         | `oklch(1 0 0)`         | blanco puro                               |
| `foreground`                         | `oklch(0.145 0 0)`     | texto principal, casi negro               |
| `card`                               | `oklch(1 0 0)`         | fondo de tarjetas                         |
| `primary`                            | `oklch(0.55 0.19 255)` | azul de acento (botones, links, foco)     |
| `secondary` / `muted` / `accent` | `oklch(0.96 0 0)`      | grises muy claros para fondos secundarios |
| `muted-foreground`                   | `oklch(0.5 0 0)`       | texto secundario/gris                     |
| `destructive`                        | `oklch(0.58 0.22 25)`  | rojo (errores, eliminar)                  |
| `border` / `input`                 | `oklch(0.9 0 0)`       | bordes sutiles                            |

**Modo oscuro (default de marca):**

| Token                                  | Valor (OKLCH)                                                     |
| -------------------------------------- | ----------------------------------------------------------------- |
| `background`                         | `oklch(0.13 0 0)` — negro/gris muy oscuro, no negro puro       |
| `foreground`                         | `oklch(0.97 0 0)`                                               |
| `card`                               | `oklch(0.17 0 0)`                                               |
| `primary`                            | `oklch(0.65 0.18 255)` — mismo azul, más claro para contraste |
| `secondary` / `muted` / `accent` | `oklch(0.22 0 0)`                                               |
| `border`                             | `oklch(1 0 0 / 10%)` — blanco al 10% de opacidad               |

No hay colores de marca fuera de este azul — nada de degradados multicolor, nada de violeta/cian (se eliminó explícitamente un estilo anterior con esos tonos a favor de este minimalismo neutro).

### Tipografía

- **Inter** — fuente principal para todo el sitio (`--font-sans`, `--font-display`)
- **Bebas Neue** — solo para titulares "cinematográficos" grandes (el hero de la home), no se usa en el resto

### Forma / bordes

- `--radius: 0.75rem` (12px) como radio base — botones, cards, inputs con esquinas redondeadas consistentes

### Componentes base disponibles (shadcn/ui)

accordion, alert-dialog, alert, avatar, badge, breadcrumb, button, card, checkbox, dialog, dropdown-menu, form, input, label, navigation-menu, pagination, popover, radio-group, scroll-area, select, separator, sheet, skeleton, slider, sonner (toasts), switch, table, tabs, textarea, tooltip.

Es decir: la app usa el look-and-feel **por defecto de shadcn/ui** con la paleta de arriba aplicada — no hay ilustraciones custom, no hay iconografía de marca propia (los íconos son Lucide, genéricos), no hay logo/isotipo diseñado (la marca se muestra como wordmark de texto "BYTE.PE").

## 4. Mapa de pantallas

### Tienda pública

| Ruta                                                                                   | Contenido                                                                                                                                                                                                  |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/` (home)                                                                           | Hero cinemático (con`CinematicBackdrop`) → banner de confianza → grilla de categorías → sección de destacados/más vendidos → propuestas de valor → banner de cupón → testimonios → CTA final |
| `/productos`                                                                         | Listado/grilla de catálogo con filtros                                                                                                                                                                    |
| `/productos/[slug]`                                                                  | Detalle de producto                                                                                                                                                                                        |
| `/carrito`                                                                           | Carrito de compras                                                                                                                                                                                         |
| `/checkout`                                                                          | Flujo de pago (wizard de varios pasos: envío, método de envío, cupón, pago, confirmación)                                                                                                             |
| `/pedido/[numero]`                                                                   | Estado de un pedido                                                                                                                                                                                        |
| `/pedido/[numero]/boleta`                                                            | Boleta/comprobante imprimible                                                                                                                                                                              |
| `/login`, `/registro`, `/olvide-contrasena`, `/restablecer-contrasena/[token]` | Autenticación                                                                                                                                                                                             |
| `/libro-de-reclamaciones`                                                            | Libro de reclamaciones (requisito legal Perú)                                                                                                                                                             |
| `/cambios-y-devoluciones`, `/terminos-y-condiciones`, `/privacidad`              | Páginas informativas/legales                                                                                                                                                                              |

### Cuenta del cliente (`/cuenta/*`)

Layout con navegación lateral (desktop) / tabs horizontales scrolleables (mobile):

- `/cuenta` — perfil (avatar, datos editables, atajos a pedidos/direcciones)
- `/cuenta/pedidos` — historial de pedidos
- `/cuenta/direcciones` — direcciones guardadas
- `/cuenta/wishlist` — lista de deseos

### Panel admin (`/admin/*`)

Sidebar de navegación fijo con estas secciones:
Dashboard, Productos, Categorías, Compras (importaciones), Couriers, Cupones, Pedidos, Devoluciones, Reclamos, Gastos, Kardex.

Patrón visual repetido en casi todas: header con título + botón de acción principal → banda de filtros/búsqueda → tabla de datos con paginación → páginas de detalle con Cards apiladas verticalmente y separadores (`Separator`) entre secciones de información.

Es una interfaz **funcional pero utilitaria** — tablas densas, formularios largos en Cards, sin dashboards visuales más allá de números en tarjetas simples. No hay gráficos/charts todavía.

## 5. Qué tan "trabajado" está el diseño hoy

- La **home pública** es la pantalla con más inversión visual: tiene hero animado, scroll reveals, efectos magnéticos en botones, spotlight en cards — es la cara más "premium" del sitio.
- El resto de la tienda pública (productos, carrito, checkout, cuenta) usa un estilo limpio pero más plano — Cards y tablas estándar de shadcn sin mucha personalización adicional.
- El **panel admin** es 100% utilitario: cero animación, cero personalización más allá de la paleta — prioriza densidad de información sobre estética, como un back-office clásico.
- No hay identidad de marca más allá del wordmark de texto y el azul de acento: sin logo diseñado, sin ilustraciones, sin fotografía de producto propia (se supone contenido subido por el admin).

## 6. Para quien use esto en Stitch

Áreas donde más impacto visual se puede ganar, en orden de visibilidad para el cliente final:

1. **Home** — ya tiene buena base de interacción; podría beneficiarse de una dirección de arte más definida (hoy es "shadcn + azul", no una identidad propia).
2. **Grilla de productos y detalle de producto** — son las pantallas que más tiempo ve un comprador real; hoy son bastante estándar.
3. **Checkout** — wizard funcional pero visualmente austero; en ecommerce esta pantalla suele beneficiarse mucho de mejoras de confianza/claridad visual.
4. **Cuenta del cliente** — recién rediseñada parcialmente (perfil con avatar), el resto (pedidos, direcciones, wishlist) sigue con el patrón Card básico.
5. **Panel admin** — bajo prioridad de "belleza" (lo usa solo el dueño del negocio), pero hay margen para mejorar jerarquía visual en tablas largas y formularios de varios pasos (ej. el formulario de compras tiene 4-5 secciones apiladas).
