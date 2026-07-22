import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/fx/magnetic";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";

/** Estado vacío consistente para listas de la cuenta (carrito, pedidos,
 * wishlist, direcciones) — antes cada página tenía su propio texto suelto
 * sin ícono ni acción, salvo el carrito. */
export function EmptyState({
  icon: Icon,
  titulo,
  descripcion,
  cta,
}: {
  icon: LucideIcon;
  titulo: string;
  descripcion: string;
  cta?: { href: string; label: string };
}) {
  return (
    <RevealOnScroll className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-24 text-center">
      <Icon className="size-10 text-muted-foreground" />
      <p className="mt-4 text-lg font-semibold">{titulo}</p>
      <p className="mt-2 text-sm text-muted-foreground">{descripcion}</p>
      {cta && (
        <Magnetic strength={0.15} className="mt-6 inline-block">
          <Button asChild>
            <Link href={cta.href}>{cta.label}</Link>
          </Button>
        </Magnetic>
      )}
    </RevealOnScroll>
  );
}
