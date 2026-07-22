"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ProductoCard } from "@/components/catalogo/producto-card";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";
import type { ProductoCatalogo } from "@/lib/mock/repo";

export function RelacionadosCarousel({
  productos,
  titulo = "También te puede interesar",
}: {
  productos: ProductoCatalogo[];
  titulo?: string;
}) {
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  // Con pocos relacionados, el carrusel no llega a desbordar — mostrar las
  // flechas igual dejaba dos botones que no hacían nada al tocarlos.
  const [desbordado, setDesbordado] = React.useState(false);

  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    function chequear() {
      setDesbordado(el!.scrollWidth > el!.clientWidth + 1);
    }

    chequear();
    const observer = new ResizeObserver(chequear);
    observer.observe(el);
    return () => observer.disconnect();
  }, [productos]);

  function scrollBy(delta: number) {
    scrollerRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">{titulo}</h2>
        {desbordado && (
          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollBy(-320)}
              aria-label="Anterior"
              className="flex size-9 items-center justify-center rounded-full border border-border/60 text-foreground/70 transition hover:border-primary/40 hover:text-primary"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(320)}
              aria-label="Siguiente"
              className="flex size-9 items-center justify-center rounded-full border border-border/60 text-foreground/70 transition hover:border-primary/40 hover:text-primary"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>

      <RevealOnScroll
        selector="[data-related-card]"
        stagger={0.08}
        y={28}
        className="mt-5"
      >
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {productos.map((p) => (
            <div key={p.id} data-related-card className="w-48 shrink-0 snap-start sm:w-56">
              <ProductoCard producto={p} />
            </div>
          ))}
        </div>
      </RevealOnScroll>
    </div>
  );
}
