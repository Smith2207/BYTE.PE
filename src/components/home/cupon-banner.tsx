import { Tag } from "lucide-react";
import { getCuponDestacado } from "@/lib/cupones/store";
import { CopiarCuponBoton } from "./copiar-cupon-boton";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";

function descripcionCupon(cupon: NonNullable<Awaited<ReturnType<typeof getCuponDestacado>>>) {
  if (cupon.tipo === "envio_gratis") return "Envío gratis en tu próxima compra";
  if (cupon.tipo === "porcentaje") return `${cupon.valor}% de descuento`;
  return `S/ ${cupon.valor.toFixed(2)} de descuento`;
}

export async function CuponBanner() {
  const cupon = await getCuponDestacado();
  if (!cupon) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <RevealOnScroll
        y={20}
        className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-primary/30 bg-primary/5 px-6 py-5 sm:flex-row"
      >
        <div className="flex items-center gap-3">
          <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <span className="absolute inset-0 rounded-full bg-primary/20 motion-safe:animate-pulse-glow" />
            <Tag className="relative size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">{descripcionCupon(cupon)}</p>
            <p className="text-xs text-muted-foreground">
              {cupon.montoMinimoCompra > 0
                ? `En compras desde ${new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(cupon.montoMinimoCompra)}`
                : "Sin monto mínimo de compra"}
            </p>
          </div>
        </div>
        <CopiarCuponBoton codigo={cupon.codigo} />
      </RevealOnScroll>
    </section>
  );
}
