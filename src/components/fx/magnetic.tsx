"use client";

import * as React from "react";
import { gsap } from "@/lib/gsap";

/**
 * Envoltorio "botón magnético": el hijo se desplaza levemente hacia el
 * cursor mientras esté dentro de sus límites, y vuelve a su posición con
 * un ease elástico al salir. Pensado para CTAs principales (sección 7).
 */
export function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const quickX = React.useRef<gsap.QuickToFunc | null>(null);
  const quickY = React.useRef<gsap.QuickToFunc | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    quickX.current = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
    quickY.current = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
  }, []);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    quickX.current?.(x * strength);
    quickY.current?.(y * strength);
  }

  function handleMouseLeave() {
    quickX.current?.(0);
    quickY.current?.(0);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </div>
  );
}
