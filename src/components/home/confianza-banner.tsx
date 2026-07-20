import { BadgeCheck, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

const items = [
  {
    icono: Truck,
    titulo: siteConfig.envioGratis ? "Envío gratis a todo el Perú" : "Envío a todo el Perú",
    desc: siteConfig.envioGratis ? "En todos tus pedidos, sin mínimo" : "Costo calculado según tu destino",
  },
  { icono: ShieldCheck, titulo: "Compra protegida", desc: "Pago seguro y datos cifrados" },
  { icono: PackageCheck, titulo: "Garantía oficial", desc: "Meses de garantía en cada producto" },
  { icono: BadgeCheck, titulo: "Cambios sin drama", desc: "7 días para cambios y devoluciones" },
];

export function ConfianzaBanner() {
  return (
    <section className="border-y border-border/50 bg-card/40">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
        {items.map((item) => (
          <div key={item.titulo} className="flex items-start gap-3">
            <item.icono className="mt-0.5 size-6 shrink-0 text-primary" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-semibold">{item.titulo}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
