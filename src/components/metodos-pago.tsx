import { Wallet, Landmark, Truck, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const METODOS = [
  { icon: Wallet, label: "Yape / Plin" },
  { icon: Landmark, label: "Transferencia bancaria" },
  { icon: CreditCard, label: "Tarjeta (Mercado Pago)" },
  { icon: Truck, label: "Contra entrega" },
] as const;

/** Señal de confianza real (no logos de marcas con las que no hay acuerdo
 * comercial, como Visa/Mastercard) — lista los métodos de pago que la
 * tienda de verdad acepta, ver src/lib/site-config.ts `datosPago`. */
export function MetodosPago({ className }: { className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {METODOS.map(({ icon: Icon, label }) => (
        <li
          key={label}
          className="flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-3 py-1.5 text-xs font-medium text-muted-foreground"
        >
          <Icon className="size-3.5" />
          {label}
        </li>
      ))}
    </ul>
  );
}
