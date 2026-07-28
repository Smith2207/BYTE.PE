/**
 * Celular ilustrado con CSS puro, mismo recurso que HeroDevice (laptop del
 * hero) pero para el CTA final — variar el tipo de equipo entre las dos
 * apariciones evita el efecto "until repetido" de mostrar la misma forma
 * dos veces en la misma página. `aria-hidden`: puramente decorativo.
 */

const APPS = 6;

export function CtaDevice() {
  return (
    <div className="pointer-events-none select-none" style={{ perspective: "1600px" }} aria-hidden="true">
      <div
        className="relative motion-safe:animate-float"
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateX(8deg) rotateY(22deg) rotateZ(-2deg)",
          animationDuration: "7s",
        }}
      >
        {/* Glow detrás del equipo */}
        <div className="absolute -inset-x-8 bottom-0 top-6 rounded-full bg-primary/30 blur-[60px] motion-safe:animate-pulse-glow" />

        {/* Cuerpo del celular */}
        <div className="relative w-[190px] rounded-[32px] border border-white/10 bg-neutral-900 p-2 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]">
          <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-neutral-950 via-neutral-900 to-primary/15 pb-5 pt-3">
            {/* Notch */}
            <div className="absolute left-1/2 top-2 h-3 w-16 -translate-x-1/2 rounded-full bg-black/60" />

            {/* Barra de estado */}
            <div className="mt-5 flex items-center justify-between px-4">
              <span className="h-1.5 w-8 rounded-full bg-white/15" />
              <span className="h-1.5 w-4 rounded-full bg-white/15" />
            </div>

            {/* Widget */}
            <div className="mx-3 mt-4 rounded-xl bg-white/[0.06] p-3">
              <span className="block h-1.5 w-2/3 rounded-full bg-white/15" />
              <span className="mt-2 block h-6 w-full rounded-lg bg-gradient-to-r from-white/[0.04] via-primary/25 to-white/[0.04] bg-[length:200%_100%] motion-safe:animate-shimmer" />
            </div>

            {/* Grilla de apps */}
            <div className="mx-3 mt-4 grid grid-cols-3 gap-3">
              {Array.from({ length: APPS }, (_, i) => (
                <span
                  key={i}
                  className="aspect-square rounded-xl bg-white/[0.07]"
                  style={i === 1 ? { background: "rgba(57,135,229,0.35)" } : undefined}
                />
              ))}
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-1.5 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-white/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
