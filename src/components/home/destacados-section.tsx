"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductoCard } from "@/components/catalogo/producto-card";
import { ensureGsapPlugins, gsap, prefersReducedMotion } from "@/lib/gsap";
import type { ProductoCatalogo } from "@/lib/mock/repo";

const DIAS_PARA_SER_NUEVO = 30;

export function DestacadosSection({
  productos,
  masVendidoIds = [],
}: {
  productos: ProductoCatalogo[];
  masVendidoIds?: string[];
}) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const masVendidoSet = new Set(masVendidoIds);
  const limiteNuevo = Date.now() - DIAS_PARA_SER_NUEVO * 24 * 60 * 60 * 1000;

  React.useEffect(() => {
    if (prefersReducedMotion()) return;
    ensureGsapPlugins();
    const ctx = gsap.context(() => {
      gsap.from("[data-destacado-card]", {
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 80%",
        },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="destacados" ref={rootRef} className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Ofertas destacadas</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Los equipos más buscados, con el mejor precio de la semana.
          </p>
        </div>
        <Link
          href="/productos"
          className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex"
        >
          Ver todo <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {productos.map((p) => {
          const etiqueta = masVendidoSet.has(p.id)
            ? ("mas-vendido" as const)
            : new Date(p.createdAt).getTime() >= limiteNuevo
              ? ("nuevo" as const)
              : undefined;
          return (
            <div key={p.id} data-destacado-card>
              <ProductoCard producto={p} etiqueta={etiqueta} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
