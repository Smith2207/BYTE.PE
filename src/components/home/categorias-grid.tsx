import Link from "next/link";
import { Cpu, Headphones, Laptop, Smartphone, Tablet } from "lucide-react";
import type { CategoriaConHijas } from "@/lib/mock/repo";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";
import { ELASTIC_EASE, STAGGER_MAX } from "@/lib/motion";

const iconos: Record<string, typeof Laptop> = {
  laptops: Laptop,
  celulares: Smartphone,
  tablets: Tablet,
  "pcs-escritorio": Cpu,
  accesorios: Headphones,
};

export function CategoriasGrid({ categorias }: { categorias: CategoriaConHijas[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Explora por categoría</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Todo lo que necesitas, organizado para encontrarlo rápido.
          </p>
        </div>
      </div>

      <RevealOnScroll
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
        selector="[data-categoria-card]"
        stagger={STAGGER_MAX}
        ease={ELASTIC_EASE}
        y={20}
      >
        {categorias.map((c) => {
          const Icono = iconos[c.slug] ?? Cpu;
          return (
            <Link
              key={c.slug}
              data-categoria-card
              href={`/productos?categoria=${c.slug}`}
              className="group relative flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-8 text-center shadow-none transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_0_24px_rgba(57,135,229,0.15)]"
            >
              <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary transition group-hover:scale-110">
                <Icono className="size-7 text-primary" strokeWidth={1.5} />
              </span>
              <span className="text-sm font-semibold">{c.nombre}</span>
            </Link>
          );
        })}
      </RevealOnScroll>
    </section>
  );
}
