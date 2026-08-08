import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductoCard } from "@/components/catalogo/producto-card";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";
import { ELASTIC_EASE, STAGGER_MAX } from "@/lib/motion";
import type { ProductoCatalogo } from "@/lib/mock/repo";

const DIAS_PARA_SER_NUEVO = 30;

export function DestacadosSection({
  productos,
  masVendidoIds = [],
}: {
  productos: ProductoCatalogo[];
  masVendidoIds?: string[];
}) {
  const masVendidoSet = new Set(masVendidoIds);
  const limiteNuevo = Date.now() - DIAS_PARA_SER_NUEVO * 24 * 60 * 60 * 1000;

  return (
    <section id="destacados" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
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

      <RevealOnScroll
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        selector="[data-destacado-card]"
        stagger={STAGGER_MAX}
        ease={ELASTIC_EASE}
        y={40}
      >
        {productos.map((p, i) => {
          const etiqueta = masVendidoSet.has(p.id)
            ? ("mas-vendido" as const)
            : new Date(p.createdAt).getTime() >= limiteNuevo
              ? ("nuevo" as const)
              : undefined;
          return (
            <div key={p.id} data-destacado-card>
              <ProductoCard producto={p} etiqueta={etiqueta} priority={i < 4} />
            </div>
          );
        })}
      </RevealOnScroll>
    </section>
  );
}
