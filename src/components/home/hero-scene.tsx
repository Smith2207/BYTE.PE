"use client";

import * as React from "react";

import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { GlowOrb, AtmosphereLayer } from "@/components/fx/cinematic-backdrop";

/**
 * Capa visual cinematográfica del Hero: video de fondo (opcional, con
 * degradación elegante si aún no hay archivo real en /public/videos) +
 * parallax por cursor + overlays (fade, glow, viñeta, rayos de luz,
 * partículas — ver cinematic-backdrop.tsx, compartido con el Hero de
 * producto).
 */

export function HeroScene({ videoSrc = "/videos/hero-tech.mp4" }: { videoSrc?: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const parallaxRef = React.useRef<HTMLDivElement>(null);
  const [videoReady, setVideoReady] = React.useState(false);

  React.useEffect(() => {
    if (prefersReducedMotion()) return;
    const container = containerRef.current;
    const target = parallaxRef.current;
    if (!container || !target) return;

    const quickX = gsap.quickTo(target, "x", { duration: 0.5, ease: "power3.out" });
    const quickY = gsap.quickTo(target, "y", { duration: 0.5, ease: "power3.out" });

    function onMove(e: MouseEvent) {
      const rect = container!.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      quickX(relX * 30);
      quickY(relY * 30);
    }

    container.addEventListener("mousemove", onMove);
    return () => container.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 h-full w-full">
      <div
        ref={parallaxRef}
        className="absolute right-0 top-0 h-full w-full scale-105 lg:w-[75%]"
      >
        {/* Fallback: escena de glow monocromo, siempre presente detrás del video */}
        <div className="absolute inset-0 overflow-hidden bg-black">
          <GlowOrb />
        </div>

        {/* Video real, opcional — si /videos/hero-tech.mp4 no existe aún,
            se queda en opacity-0 y no rompe nada visualmente. */}
        <video
          autoPlay
          muted
          loop
          playsInline
          onCanPlay={() => setVideoReady(true)}
          onError={() => setVideoReady(false)}
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      </div>

      {/* Fade oscuro: sólido a la izquierda para sostener el texto,
          transparente hacia la derecha donde vive el video/glow. */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />

      <AtmosphereLayer glowPosition="70% 45%" />
    </div>
  );
}
