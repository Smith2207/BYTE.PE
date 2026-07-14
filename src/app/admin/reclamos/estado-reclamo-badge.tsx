import { Badge } from "@/components/ui/badge";
import type { EstadoReclamo } from "@/db/schema/enums";

export const ESTADO_RECLAMO_ESTILO: Record<EstadoReclamo, string> = {
  registrado: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  en_proceso: "border-sky-500/30 bg-sky-500/10 text-sky-500",
  resuelto: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
};

export const ESTADO_RECLAMO_ETIQUETA: Record<EstadoReclamo, string> = {
  registrado: "Registrado",
  en_proceso: "En proceso",
  resuelto: "Resuelto",
};

export function EstadoReclamoBadge({ estado }: { estado: EstadoReclamo }) {
  return (
    <Badge variant="outline" className={ESTADO_RECLAMO_ESTILO[estado]}>
      {ESTADO_RECLAMO_ETIQUETA[estado]}
    </Badge>
  );
}
