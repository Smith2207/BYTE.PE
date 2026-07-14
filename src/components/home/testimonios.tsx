import Link from "next/link";
import { Star } from "lucide-react";
import { listarResenasDestacadas } from "@/lib/resenas/store";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";

export async function Testimonios() {
  const resenas = await listarResenasDestacadas(3);
  // Sin suficientes reseñas reales todavía: se oculta el bloque entero en
  // vez de inventar contenido falso.
  if (resenas.length < 3) return null;

  return (
    <RevealOnScroll
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      selector="[data-testimonio]"
      stagger={0.1}
      y={24}
    >
      <div className="mb-10 text-center">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Lo que dicen nuestros clientes</h2>
        <p className="mt-2 text-sm text-muted-foreground">Reseñas reales de compras reales.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        {resenas.map((r) => (
          <div key={r.id} data-testimonio className="rounded-2xl border border-border/60 bg-card p-6">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={`size-4 ${n <= r.calificacion ? "fill-accent text-accent" : "text-muted-foreground"}`}
                />
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground/90">&ldquo;{r.comentario}&rdquo;</p>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{r.usuarioNombre}</span>
              <Link href={`/productos/${r.productoSlug}`} className="hover:text-primary hover:underline">
                {r.productoNombre}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </RevealOnScroll>
  );
}
