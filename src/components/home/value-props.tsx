import { FileCheck, PackageCheck, Receipt, Wallet } from "lucide-react";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";
import { SpotlightCard } from "@/components/fx/spotlight-card";
import { ScrollParallax } from "@/components/fx/scroll-parallax";
import { cn } from "@/lib/utils";
import { STAGGER_MAX } from "@/lib/motion";

const props = [
  {
    icono: Receipt,
    titulo: "Precio final sin sorpresas",
    descripcion: "El IGV ya está incluido — lo que ves es lo que pagas, nada se suma en el checkout.",
  },
  {
    icono: Wallet,
    titulo: "Yape, Plin o contra entrega",
    descripcion: "Paga como te sea más cómodo, sin depender solo de tarjeta.",
  },
  {
    icono: FileCheck,
    titulo: "Boleta o factura al instante",
    descripcion: "Descarga tu comprobante apenas confirmas la compra, sin esperar.",
  },
  {
    icono: PackageCheck,
    titulo: "Stock verificado en tiempo real",
    descripcion: "Si lo ves disponible, lo tenemos — nada de pedidos que se cancelan por falta de stock.",
  },
];

/** Distribución tipo "bento": la primera tarjeta (el diferenciador más
 * fuerte) ocupa el doble de espacio; las demás se acomodan alrededor. */
const layout = [
  "col-span-2 lg:col-span-2 lg:row-span-2",
  "col-span-2 lg:col-span-2",
  "col-span-1",
  "col-span-1",
];

export function ValueProps() {
  return (
    <RevealOnScroll
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      selector="[data-value-prop]"
      stagger={STAGGER_MAX}
      y={24}
    >
      <div className="mb-10 text-center">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Por qué comprar en BYTE.PE</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Lo que otras tiendas prometen, acá ya funciona así.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:grid-rows-2">
        {props.map((prop, i) => {
          const destacado = i === 0;
          return (
            <div key={prop.titulo} data-value-prop className={layout[i]}>
              <SpotlightCard className="relative flex h-full flex-col justify-between overflow-hidden p-6 sm:p-8">
                {destacado && (
                  <ScrollParallax className="pointer-events-none absolute -right-8 -top-8">
                    <prop.icono className="size-40 text-primary/[0.07]" strokeWidth={1} />
                  </ScrollParallax>
                )}
                <span
                  className={cn(
                    "relative flex items-center justify-center rounded-2xl bg-primary/10 text-primary",
                    destacado ? "size-14" : "size-11",
                  )}
                >
                  <prop.icono className={destacado ? "size-7" : "size-5"} strokeWidth={1.75} />
                </span>
                <div className="relative mt-6">
                  <h3 className={cn("font-semibold", destacado ? "text-lg sm:text-xl" : "text-sm")}>
                    {prop.titulo}
                  </h3>
                  <p className={cn("mt-1.5 text-muted-foreground", destacado ? "text-sm sm:text-base" : "text-sm")}>
                    {prop.descripcion}
                  </p>
                </div>
              </SpotlightCard>
            </div>
          );
        })}
      </div>
    </RevealOnScroll>
  );
}
