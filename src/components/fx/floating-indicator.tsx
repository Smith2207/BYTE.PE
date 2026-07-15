"use client";

import * as React from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { ELASTIC_EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Pastilla animada que "viaja" elásticamente hacia el ítem activo dentro
 * de un contenedor relativo — para nav links o step-pills. El contenedor
 * debe tener `position: relative` (o dejar que este componente lo agregue
 * vía className) y los ítems deben tener `data-indicator-item` +
 * `data-active="true"` en el que esté activo.
 */
export function FloatingIndicator({
  containerRef,
  activeKey,
  className,
}: {
  containerRef: React.RefObject<HTMLElement>;
  /** Cualquier valor que cambie cuando el ítem activo cambia (ej. el pathname o el índice de paso) — dispara la re-medición. */
  activeKey: string | number;
  className?: string;
}) {
  const indicadorRef = React.useRef<HTMLDivElement>(null);
  const quickX = React.useRef<gsap.QuickToFunc | null>(null);
  const quickWidth = React.useRef<gsap.QuickToFunc | null>(null);

  React.useEffect(() => {
    const indicador = indicadorRef.current;
    if (!indicador) return;
    quickX.current = gsap.quickTo(indicador, "x", { duration: 0.5, ease: ELASTIC_EASE });
    quickWidth.current = gsap.quickTo(indicador, "width", { duration: 0.5, ease: ELASTIC_EASE });
  }, []);

  const mover = React.useCallback(() => {
    const contenedor = containerRef.current;
    const indicador = indicadorRef.current;
    if (!contenedor || !indicador) return;
    const activo = contenedor.querySelector<HTMLElement>('[data-indicator-item][data-active="true"]');
    if (!activo) {
      indicador.style.opacity = "0";
      return;
    }
    indicador.style.opacity = "1";
    const rectContenedor = contenedor.getBoundingClientRect();
    const rectActivo = activo.getBoundingClientRect();
    const x = rectActivo.left - rectContenedor.left;

    if (prefersReducedMotion() || !quickX.current || !quickWidth.current) {
      gsap.set(indicador, { x, width: rectActivo.width });
      return;
    }
    quickX.current(x);
    quickWidth.current(rectActivo.width);
  }, [containerRef]);

  React.useEffect(() => {
    mover();
    window.addEventListener("resize", mover);
    return () => window.removeEventListener("resize", mover);
  }, [mover, activeKey]);

  return (
    <div
      ref={indicadorRef}
      aria-hidden
      className={cn(
        "pointer-events-none absolute left-0 top-0 h-full rounded-full bg-secondary opacity-0",
        className,
      )}
    />
  );
}
