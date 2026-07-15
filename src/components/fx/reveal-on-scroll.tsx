"use client";

import * as React from "react";

import { ensureGsapPlugins, gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * Envoltorio genérico: revela su contenido (fade + y + blur) cuando entra
 * al viewport, vía GSAP ScrollTrigger. Pensado para secciones completas
 * de la página de producto (specs, relacionados, reseñas).
 */
export function RevealOnScroll({
  children,
  className,
  y = 40,
  stagger,
  selector,
  ease = "power3.out",
}: {
  children: React.ReactNode;
  className?: string;
  /** Distancia inicial en px */
  y?: number;
  /** Si se define, anima los hijos que matcheen este selector con stagger, en vez del contenedor completo. */
  stagger?: number;
  selector?: string;
  /** GSAP ease — por defecto "power3.out"; pasa ELASTIC_EASE (src/lib/motion.ts) para la dirección "High-End Cyberpunk Minimalist". */
  ease?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    ensureGsapPlugins();

    const targets = selector ? el.querySelectorAll(selector) : el;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y, filter: "blur(6px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.9,
          ease,
          stagger: stagger ?? 0,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [y, stagger, selector, ease]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
