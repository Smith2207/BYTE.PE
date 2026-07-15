import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";
import { ELASTIC_EASE, STAGGER_MAX } from "@/lib/motion";

export function EspecificacionesCards({ specs }: { specs: Record<string, string> }) {
  const entradas = Object.entries(specs);
  if (entradas.length === 0) return null;

  return (
    <div className="mt-16">
      <h2 className="font-display text-xl font-semibold">Ficha técnica</h2>
      <RevealOnScroll
        className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        selector="[data-spec-card]"
        stagger={STAGGER_MAX}
        ease={ELASTIC_EASE}
        y={24}
      >
        {entradas.map(([clave, valor]) => (
          <div
            key={clave}
            data-spec-card
            className="rounded-2xl border border-border/60 bg-card/60 p-4 transition-colors hover:border-primary/40"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {clave}
            </p>
            <p className="mt-1.5 font-mono text-sm font-semibold text-foreground">{valor}</p>
          </div>
        ))}
      </RevealOnScroll>
    </div>
  );
}
