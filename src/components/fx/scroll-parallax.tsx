"use client";

import * as React from "react";

import { ensureGsapPlugins, gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * Traslada verticalmente su contenido en sincronía con el scroll (scrub real,
 * no una animación de duración fija) — pensado para elementos decorativos
 * (íconos de fondo, orbes) dentro de una sección más grande.
 */
export function ScrollParallax({
  children,
  className,
  range = 60,
}: {
  children: React.ReactNode;
  className?: string;
  /** Desplazamiento total en px entre el inicio y el fin del recorrido. */
  range?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    ensureGsapPlugins();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: -range / 2 },
        {
          y: range / 2,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [range]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
