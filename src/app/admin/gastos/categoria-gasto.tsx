import { Badge } from "@/components/ui/badge";
import type { CategoriaGasto } from "@/db/schema/enums";

export const CATEGORIA_GASTO_ETIQUETA: Record<CategoriaGasto, string> = {
  alquiler: "Alquiler",
  marketing: "Marketing",
  sueldos: "Sueldos",
  servicios: "Servicios",
  otros: "Otros",
};

const CATEGORIA_GASTO_ESTILO: Record<CategoriaGasto, string> = {
  alquiler: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  marketing: "border-sky-500/30 bg-sky-500/10 text-sky-500",
  sueldos: "border-violet-500/30 bg-violet-500/10 text-violet-500",
  servicios: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  otros: "border-border/60 bg-secondary text-foreground/70",
};

export function CategoriaGastoBadge({ categoria }: { categoria: CategoriaGasto }) {
  return (
    <Badge variant="outline" className={CATEGORIA_GASTO_ESTILO[categoria]}>
      {CATEGORIA_GASTO_ETIQUETA[categoria]}
    </Badge>
  );
}
