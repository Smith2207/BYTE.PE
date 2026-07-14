import { FileCheck, PackageCheck, Receipt, Wallet } from "lucide-react";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";

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

export function ValueProps() {
  return (
    <RevealOnScroll
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      selector="[data-value-prop]"
      stagger={0.1}
      y={24}
    >
      <div className="mb-10 text-center">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Por qué comprar en BYTE.PE</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Lo que otras tiendas prometen, acá ya funciona así.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {props.map((prop) => (
          <div
            key={prop.titulo}
            data-value-prop
            className="rounded-2xl border border-border/60 bg-card p-6 transition hover:border-primary/40"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <prop.icono className="size-5" strokeWidth={1.75} />
            </span>
            <h3 className="mt-4 text-sm font-semibold">{prop.titulo}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{prop.descripcion}</p>
          </div>
        ))}
      </div>
    </RevealOnScroll>
  );
}
