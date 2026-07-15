"use client";

import * as React from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const CARACTERES = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!<>-_\\/[]{}—=+*^?#";

/**
 * Anima el texto "resolviéndose" desde caracteres aleatorios hasta el
 * valor final — pensado para precios/specs en font-mono que recién
 * terminan de calcularse (dirección "High-End Cyberpunk Minimalist", ver
 * docs/brief-diseno-stitch.md). Se dispara al montar y cada vez que
 * cambia `value`. Sin dependencias externas — un ticker de GSAP.
 */
export function TextScramble({
  value,
  className,
  durationMs = 500,
}: {
  value: string;
  className?: string;
  durationMs?: number;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.textContent = value;
      return;
    }

    const largoFinal = value.length;
    const progresoPorCaracter = 1 / largoFinal;
    let frame = 0;
    const totalFrames = Math.round((durationMs / 1000) * 60);

    const ticker = () => {
      frame++;
      const progresoGlobal = frame / totalFrames;
      let salida = "";
      for (let i = 0; i < largoFinal; i++) {
        const progresoCaracter = i * progresoPorCaracter;
        if (progresoGlobal > progresoCaracter + 0.3) {
          salida += value[i];
        } else if (value[i] === " ") {
          salida += " ";
        } else {
          salida += CARACTERES[Math.floor(Math.random() * CARACTERES.length)];
        }
      }
      el.textContent = salida;

      if (frame >= totalFrames) {
        el.textContent = value;
        gsap.ticker.remove(ticker);
      }
    };

    gsap.ticker.add(ticker);
    return () => gsap.ticker.remove(ticker);
  }, [value, durationMs]);

  return (
    <span ref={ref} className={cn("font-mono tabular-nums", className)}>
      {value}
    </span>
  );
}
