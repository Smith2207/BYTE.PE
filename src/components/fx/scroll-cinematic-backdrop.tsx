"use client";

import * as React from "react";
import { GlowOrb, AtmosphereLayer } from "@/components/fx/cinematic-backdrop";
import { ensureGsapPlugins, gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * Fondo cinemático fijo (mismas piezas del Hero de la home: GlowOrb +
 * AtmosphereLayer) cuya rotación/escala/posición se controla con el
 * scroll físico de la página (GSAP ScrollTrigger, `scrub: 1.5` — avanza
 * al bajar, retrocede con inercia al subir). No depende de un archivo de
 * video: es 100% las capas atmosféricas ya existentes, animadas.
 * Pensado para login/registro/perfil — páginas cortas con una Card por
 * encima en glassmorphism (`bg-card/80 backdrop-blur-lg`).
 */
export function ScrollCinematicBackdrop() {
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = rootRef.current;
    if (!el || prefersReducedMotion()) return;
    ensureGsapPlugins();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { rotation: -6, scale: 1, y: 0 },
        {
          rotation: 10,
          scale: 1.18,
          y: -50,
          ease: "none",
          scrollTrigger: {
            trigger: document.documentElement,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5,
          },
        },
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      <div ref={rootRef} className="absolute inset-0 scale-110 mix-blend-screen opacity-40">
        <GlowOrb />
        <AtmosphereLayer glowPosition="50% 40%" intensity={0.6} showRays={false} />
      </div>
    </div>
  );
}
