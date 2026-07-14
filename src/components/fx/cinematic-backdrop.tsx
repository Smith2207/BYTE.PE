import { CHART_SERIE_PRINCIPAL } from "@/lib/chart-colors";

/**
 * Piezas atmosféricas reutilizables para secciones "cinematográficas"
 * sobre fondo negro — un solo hue (el azul ya validado para gráficos),
 * sin lógica de mouse propia. Usadas por el Hero del home, el Hero de
 * producto y el fondo ambiental del resto de la página de producto.
 */
const PARTICULAS = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 6.25 + (i % 3) * 9) % 100,
  delay: (i % 6) * 1.2,
  duration: 7 + (i % 5) * 1.3,
  size: i % 4 === 0 ? 3 : 2,
}));

/** Glow central + anillos rotando lentamente. */
export function GlowOrb({ className }: { className?: string }) {
  return (
    <div className={className ?? "absolute inset-0 overflow-hidden"}>
      <div className="absolute left-1/2 top-1/2 size-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/25 blur-[100px]" />
      <div className="absolute left-1/2 top-1/2 size-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[80px] motion-safe:animate-pulse-glow" />
      <div className="absolute left-1/2 top-1/2 size-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 motion-safe:animate-spin-slow" />
      <div className="absolute left-1/2 top-1/2 size-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.06] motion-safe:animate-spin-slow-reverse" />
    </div>
  );
}

/** Tinte de glow + viñeta + rayos de luz + partículas, a intensidad ajustable. */
export function AtmosphereLayer({
  glowPosition = "70% 45%",
  intensity = 1,
  showRays = true,
  showParticles = true,
  showVignette = true,
  blend = true,
}: {
  glowPosition?: string;
  intensity?: number;
  showRays?: boolean;
  showParticles?: boolean;
  showVignette?: boolean;
  /** mix-blend-screen amplifica mucho el color sobre fondos oscuros — se
   * usa dentro del Hero (sobre negro sólido), pero se desactiva para el
   * glow ambiental de fondo de página, donde debe quedar apenas visible. */
  blend?: boolean;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className={blend ? "absolute inset-0 mix-blend-screen" : "absolute inset-0"}
        style={{
          background: `radial-gradient(circle at ${glowPosition}, ${CHART_SERIE_PRINCIPAL}${Math.round(
            intensity * (blend ? 51 : 30),
          )
            .toString(16)
            .padStart(2, "0")}, transparent 70%)`,
        }}
      />

      {showVignette && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ boxShadow: `inset 0 0 150px rgba(0,0,0,${0.65 * intensity})` }}
        />
      )}

      {showRays && (
        <>
          <div className="pointer-events-none absolute -right-10 -top-20 h-[40rem] w-40 -rotate-45 bg-gradient-to-b from-primary/20 to-transparent blur-[80px] motion-safe:animate-pulse-glow" />
          <div className="pointer-events-none absolute right-20 -top-10 h-[34rem] w-32 -rotate-45 bg-gradient-to-b from-white/10 to-transparent blur-[100px] [animation-delay:1.2s] motion-safe:animate-pulse-glow" />
        </>
      )}

      {showParticles && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {PARTICULAS.map((p, i) => (
            <span
              key={i}
              className="absolute bottom-0 rounded-full bg-white/70 motion-safe:animate-float-up"
              style={{
                left: `${p.left}%`,
                width: p.size,
                height: p.size,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
