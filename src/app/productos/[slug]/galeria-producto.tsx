"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { ProductoMedia } from "@/components/catalogo/producto-media";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { gsap, prefersReducedMotion, hasFinePointer } from "@/lib/gsap";
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
  const [lightboxAbierto, setLightboxAbierto] = React.useState(false);
  const frameRef = React.useRef<HTMLButtonElement>(null);
  const imgWrapRef = React.useRef<HTMLDivElement>(null);
  const primerRender = React.useRef(true);

  const anterior = React.useCallback(() => {
    setSeleccionada((i) => (i - 1 + imagenes.length) % imagenes.length);
  }, [imagenes.length]);
  const siguiente = React.useCallback(() => {
    setSeleccionada((i) => (i + 1) % imagenes.length);
  }, [imagenes.length]);

  React.useEffect(() => {
    if (!lightboxAbierto) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") anterior();
      if (e.key === "ArrowRight") siguiente();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxAbierto, anterior, siguiente]);

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
    if (prefersReducedMotion() || !hasFinePointer()) return;
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
      <button
        type="button"
        ref={frameRef}
        onClick={() => setLightboxAbierto(true)}
        aria-label="Ampliar foto del producto"
        className="group relative block w-full cursor-zoom-in overflow-hidden rounded-3xl border border-foreground/10 bg-foreground/5 text-left"
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
        <div className="absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur transition-opacity group-hover:opacity-100 sm:opacity-0">
          <ZoomIn className="size-4" />
        </div>
      </button>

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

      <Dialog open={lightboxAbierto} onOpenChange={setLightboxAbierto}>
        <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none sm:rounded-2xl">
          <DialogTitle className="sr-only">{nombre}</DialogTitle>
          <div className="relative">
            <ProductoMedia
              categoriaSlug={categoriaSlug}
              imagenUrl={imagenes[seleccionada]}
              alt={nombre}
              className="aspect-square w-full rounded-2xl"
              iconClassName="size-32 text-foreground/40"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
            {imagenes.length > 1 && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  aria-label="Foto anterior"
                  onClick={anterior}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full shadow-md"
                >
                  <ChevronLeft className="size-5" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  aria-label="Foto siguiente"
                  onClick={siguiente}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full shadow-md"
                >
                  <ChevronRight className="size-5" />
                </Button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-3 py-1 text-xs font-medium backdrop-blur">
                  {seleccionada + 1} / {imagenes.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
