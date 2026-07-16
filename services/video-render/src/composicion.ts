export type DatosProducto = {
  productoId: string;
  nombre: string;
  marca: string;
  precio: number;
  imagenes: string[];
  specsJson: Record<string, string>;
};

const ANCHO = 1080;
const ALTO = 1080;
const DURACION = 8;

function escapeHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatoPEN(monto: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(monto);
}

/**
 * Genera la composición HTML que HyperFrames renderiza a MP4 (ver
 * https://github.com/heygen-com/hyperframes — CLI `hyperframes render`,
 * estructura basada en el template oficial packages/cli/src/templates/blank).
 * Un video corto (~8s): foto de producto con zoom sutil (Ken Burns) y
 * marca/nombre/precio/specs apareciendo en cascada, con la paleta oscura +
 * acento azul del sitio (ver src/app/globals.css).
 */
export function generarComposicionHtml(datos: DatosProducto): string {
  const imagenPrincipal = datos.imagenes[0];
  const specsDestacadas = Object.entries(datos.specsJson).slice(0, 3);

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${ANCHO}, height=${ALTO}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap"
      rel="stylesheet"
    />
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      html,
      body {
        width: ${ANCHO}px;
        height: ${ALTO}px;
        overflow: hidden;
        background: oklch(0.13 0 0);
      }
      body {
        font-family: "Inter", sans-serif;
        color: #fff;
      }
      #imagen-wrap {
        position: absolute;
        inset: 0;
        overflow: hidden;
      }
      #imagen {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      #velo {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, oklch(0.13 0 0) 0%, rgba(0, 0, 0, 0) 45%);
      }
      #panel {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 64px 56px 72px;
      }
      #marca {
        font-size: 28px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: oklch(0.65 0.18 255);
        opacity: 0;
      }
      #nombre {
        margin-top: 12px;
        font-size: 48px;
        font-weight: 800;
        line-height: 1.1;
        opacity: 0;
      }
      #precio {
        margin-top: 24px;
        font-size: 64px;
        font-weight: 800;
        color: oklch(0.65 0.18 255);
        opacity: 0;
      }
      #specs {
        margin-top: 28px;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      .spec {
        padding: 10px 18px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.16);
        background: rgba(255, 255, 255, 0.06);
        font-size: 22px;
        opacity: 0;
      }
    </style>
  </head>
  <body>
    <div
      id="root"
      data-composition-id="producto"
      data-start="0"
      data-duration="${DURACION}"
      data-width="${ANCHO}"
      data-height="${ALTO}"
    >
      <div id="imagen-wrap" class="clip" data-start="0" data-duration="${DURACION}" data-track-index="0">
        ${imagenPrincipal ? `<img id="imagen" src="${escapeHtml(imagenPrincipal)}" />` : ""}
        <div id="velo"></div>
      </div>

      <div id="panel" class="clip" data-start="0" data-duration="${DURACION}" data-track-index="1">
        <div id="marca">${escapeHtml(datos.marca)}</div>
        <div id="nombre">${escapeHtml(datos.nombre)}</div>
        <div id="precio">${escapeHtml(formatoPEN(datos.precio))}</div>
        <div id="specs">
          ${specsDestacadas
            .map(
              ([clave, valor]) =>
                `<div class="spec">${escapeHtml(clave)}: ${escapeHtml(valor)}</div>`,
            )
            .join("\n          ")}
        </div>
      </div>
    </div>

    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });

      // Ken Burns sutil sobre toda la duración.
      tl.fromTo("#imagen", { scale: 1 }, { scale: 1.08, duration: ${DURACION}, ease: "none" }, 0);

      tl.fromTo("#marca", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, 0.6)
        .fromTo("#nombre", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, 1.2)
        .fromTo("#precio", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, 3.2)
        .fromTo(".spec", { opacity: 0 }, { opacity: 1, duration: 0.4, stagger: 0.2 }, 5.2);

      window.__timelines["producto"] = tl;
    </script>
  </body>
</html>
`;
}
