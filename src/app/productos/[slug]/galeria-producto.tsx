"use client";

import * as React from "react";
import { ProductoMedia } from "@/components/catalogo/producto-media";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Galería premium: zoom + ligera inclinación 3D con el cursor, barrido de
 * luz al hover, transición entre imágenes en crossfade (no salto seco) y
 * thumbnails con anillo de acento en vez de borde plano.
 */
export function GaleriaProducto({
  categoriaSlug,
  imagenes,
  nombre,
}: {
  categoriaSlug: string;
  imagenes: string[];
  nombre: string;
}) {
  const [seleccionada, setSeleccionada] = React.useState(0);
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
        className="group relative overflow-hidden rounded-3xl border border-foreground/10 bg-foreground/5"
        style={{ perspective: "1000px" }}
      >
        <div ref={imgWrapRef} style={{ transformStyle: "preserve-3d" }}>
          <ProductoMedia
            categoriaSlug={categoriaSlug}
            imagenUrl={imagenes[seleccionada]}
            alt={nombre}
            className="aspect-square w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            iconClassName="size-32 text-foreground/40"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>
        {/* Barrido de luz al hover */}
        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-tr from-transparent via-foreground/10 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full" />
      </div>

      {imagenes.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {imagenes.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setSeleccionada(i)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-xl border transition-all duration-300",
                i === seleccionada
                  ? "border-primary ring-2 ring-primary/40"
                  : "border-foreground/10 opacity-60 hover:opacity-100",
              )}
            >
              <ProductoMedia
                categoriaSlug={categoriaSlug}
                imagenUrl={url}
                alt={`${nombre} — foto ${i + 1}`}
                className="size-16"
                iconClassName="size-6 text-foreground/40"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
