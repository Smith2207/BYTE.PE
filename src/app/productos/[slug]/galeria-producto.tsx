"use client";

import * as React from "react";
import { PlayCircle } from "lucide-react";
import { ProductoMedia } from "@/components/catalogo/producto-media";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Galería premium: zoom + ligera inclinación 3D con el cursor, barrido de
 * luz al hover, transición entre imágenes en crossfade (no salto seco) y
 * thumbnails con anillo de acento en vez de borde plano. Si el producto
 * tiene un video autogenerado (HyperFrames) listo, aparece como un
 * thumbnail más — no reemplaza las fotos, se elige aparte.
 */
export function GaleriaProducto({
  categoriaSlug,
  imagenes,
  nombre,
  videoUrl,
}: {
  categoriaSlug: string;
  imagenes: string[];
  nombre: string;
  videoUrl?: string | null;
}) {
  const [seleccionada, setSeleccionada] = React.useState(0);
  const [mostrandoVideo, setMostrandoVideo] = React.useState(false);
  const frameRef = React.useRef<HTMLDivElement>(null);
  const imgWrapRef = React.useRef<HTMLDivElement>(null);
  const primerRender = React.useRef(true);

  React.useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false;
      return;
    }
    if (prefersReducedMotion()) return;
    const el = imgWrapRef.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { opacity: 0.35, scale: 1.03 },
      { opacity: 1, scale: 1, duration: 0.55, ease: "power2.out" },
    );
  }, [seleccionada]);

  React.useEffect(() => {
    if (prefersReducedMotion()) return;
    const frame = frameRef.current;
    const target = imgWrapRef.current;
    if (!frame || !target) return;

    const quickRotX = gsap.quickTo(target, "rotationX", { duration: 0.4, ease: "power3.out" });
    const quickRotY = gsap.quickTo(target, "rotationY", { duration: 0.4, ease: "power3.out" });

    function onMove(e: MouseEvent) {
      const rect = frame!.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      quickRotY(relX * 6);
      quickRotX(-relY * 6);
    }
    function onLeave() {
      quickRotX(0);
      quickRotY(0);
    }

    frame.addEventListener("mousemove", onMove);
    frame.addEventListener("mouseleave", onLeave);
    return () => {
      frame.removeEventListener("mousemove", onMove);
      frame.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div>
      <div
        ref={frameRef}
        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5"
        style={{ perspective: "1000px" }}
      >
        {mostrandoVideo && videoUrl ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            controls
            autoPlay
            muted
            loop
            playsInline
            src={videoUrl}
            className="aspect-square w-full bg-black object-cover"
          />
        ) : (
          <div ref={imgWrapRef} style={{ transformStyle: "preserve-3d" }}>
            <ProductoMedia
              categoriaSlug={categoriaSlug}
              imagenUrl={imagenes[seleccionada]}
              alt={nombre}
              className="aspect-square w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              iconClassName="size-32 text-white/40"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
        )}
        {/* Barrido de luz al hover */}
        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-tr from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full" />
      </div>

      {(imagenes.length > 1 || videoUrl) && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {imagenes.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => {
                setMostrandoVideo(false);
                setSeleccionada(i);
              }}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-xl border transition-all duration-300",
                !mostrandoVideo && i === seleccionada
                  ? "border-primary ring-2 ring-primary/40"
                  : "border-white/10 opacity-60 hover:opacity-100",
              )}
            >
              <ProductoMedia
                categoriaSlug={categoriaSlug}
                imagenUrl={url}
                alt={`${nombre} — foto ${i + 1}`}
                className="size-16"
                iconClassName="size-6 text-white/40"
                sizes="64px"
              />
            </button>
          ))}
          {videoUrl && (
            <button
              type="button"
              onClick={() => setMostrandoVideo(true)}
              aria-label="Ver video del producto"
              className={cn(
                "relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-black/60 transition-all duration-300",
                mostrandoVideo
                  ? "border-primary ring-2 ring-primary/40"
                  : "border-white/10 opacity-60 hover:opacity-100",
              )}
            >
              <PlayCircle className="size-6 text-white" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
