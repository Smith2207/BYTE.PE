/**
 * Laptop ilustrada con CSS puro (transforms 3D, sin imagen ni SVG externo)
 * para el hero del home — reemplaza la necesidad de una foto de producto
 * real ahí, con un mockup "pantalla con dashboard" en el mismo azul del
 * resto del sitio (CHART_SERIE_PRINCIPAL). `aria-hidden`: es puramente
 * decorativo, el hero ya tiene su propio texto accesible.
 */

const BARRAS_GRAFICO = [45, 70, 50, 85, 60];
const LINEAS_SIDEBAR = [100, 70, 85, 55];

export function HeroDevice() {
  return (
    <div className="pointer-events-none select-none" style={{ perspective: "1800px" }} aria-hidden="true">
      <div
        className="relative motion-safe:animate-float"
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateX(10deg) rotateY(-26deg) rotateZ(1deg)",
        }}
      >
        {/* Glow debajo del equipo, mismo recurso que el resto del hero */}
        <div className="absolute -inset-x-12 bottom-0 h-40 rounded-full bg-primary/30 blur-[70px] motion-safe:animate-pulse-glow" />

        {/* Pantalla */}
        <div className="relative w-[420px] rounded-[20px] border border-white/10 bg-neutral-900 p-2.5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] xl:w-[480px]">
          <div className="overflow-hidden rounded-[12px] bg-gradient-to-br from-neutral-950 via-neutral-900 to-primary/15 p-4">
            {/* Barra superior tipo ventana */}
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-white/20" />
              <span className="size-2 rounded-full bg-white/20" />
              <span className="size-2 rounded-full bg-white/20" />
              <span className="ml-2 h-1.5 max-w-[140px] flex-1 rounded-full bg-white/10" />
            </div>

            <div className="mt-4 flex gap-3">
              {/* Sidebar */}
              <div className="flex w-14 shrink-0 flex-col gap-2 pt-1">
                {LINEAS_SIDEBAR.map((ancho, i) => (
                  <span key={i} className="h-1.5 rounded-full bg-white/10" style={{ width: `${ancho}%` }} />
                ))}
              </div>

              {/* Contenido: skeleton con brillo + mini gráfico + texto */}
              <div className="flex-1 space-y-3">
                <div className="h-16 rounded-lg bg-gradient-to-r from-white/[0.06] via-white/[0.14] to-white/[0.06] bg-[length:200%_100%] motion-safe:animate-shimmer" />
                <div className="flex h-14 items-end gap-1.5">
                  {BARRAS_GRAFICO.map((alto, i) => (
                    <span key={i} className="flex-1 rounded-t-sm bg-primary/70" style={{ height: `${alto}%` }} />
                  ))}
                </div>
                <div className="space-y-1.5">
                  <span className="block h-1.5 w-full rounded-full bg-white/10" />
                  <span className="block h-1.5 w-3/4 rounded-full bg-white/10" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Base / teclado, apenas más ancha que la pantalla como en una laptop real */}
        <div className="relative mx-auto -mt-1 h-4 w-[440px] rounded-b-[14px] border border-t-0 border-white/10 bg-neutral-800 xl:w-[500px]">
          <span className="absolute left-1/2 top-0 h-1 w-16 -translate-x-1/2 rounded-b-md bg-black/40" />
        </div>
      </div>
    </div>
  );
}
