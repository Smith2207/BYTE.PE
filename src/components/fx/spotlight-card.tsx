"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const TILT_MAX_DEG = 8;

/**
 * Envoltorio estilo "Magic UI": sigue el cursor con un glow radial sutil
 * detrás del contenido (vía variables CSS, sin re-render de React) y le
 * suma un tilt 3D sutil + leve elevación — todo por GSAP en el mismo
 * transform, para que no compita con transiciones CSS del propio
 * elemento. El borde se ilumina levemente al hover, simulando un reflejo.
 */
export function SpotlightCard({
  children,
  className,
  spotlightColor = "oklch(0.65 0.18 255 / 25%)",
}: {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const quickRotX = React.useRef<gsap.QuickToFunc | null>(null);
  const quickRotY = React.useRef<gsap.QuickToFunc | null>(null);
  const quickY = React.useRef<gsap.QuickToFunc | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    gsap.set(el, { transformPerspective: 800 });
    quickRotX.current = gsap.quickTo(el, "rotationX", { duration: 0.4, ease: "power3.out" });
    quickRotY.current = gsap.quickTo(el, "rotationY", { duration: 0.4, ease: "power3.out" });
    quickY.current = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
  }, []);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    el.style.setProperty("--spot-x", `${relX}px`);
    el.style.setProperty("--spot-y", `${relY}px`);

    if (prefersReducedMotion()) return;
    const px = relX / rect.width - 0.5; // -0.5..0.5
    const py = relY / rect.height - 0.5;
    quickRotY.current?.(px * TILT_MAX_DEG * 2);
    quickRotX.current?.(-py * TILT_MAX_DEG * 2);
    quickY.current?.(-4);
  }

  function handleMouseLeave() {
    quickRotX.current?.(0);
    quickRotY.current?.(0);
    quickY.current?.(0);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-card transition-shadow duration-300 hover:border-primary/40 hover:shadow-[0_0_0_1px_oklch(0.65_0.18_255_/_25%),0_20px_40px_-15px_oklch(0.65_0.18_255_/_35%)]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(500px circle at var(--spot-x, 50%) var(--spot-y, 50%), ${spotlightColor}, transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
}
