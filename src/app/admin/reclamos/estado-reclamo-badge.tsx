import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EstadoReclamo } from "@/db/schema/enums";

export const ESTADO_RECLAMO_ESTILO: Record<EstadoReclamo, string> = {
  registrado: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  en_proceso: "border-sky-500/30 bg-sky-500/10 text-sky-500",
  resuelto: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
};

// Mismo color que ESTADO_RECLAMO_ESTILO, solo como sombra — para el
// efecto "neon" de la consola admin (mismo patrón que pedidos).
const ESTADO_RECLAMO_GLOW: Record<EstadoReclamo, string> = {
  registrado: "shadow-[0_0_14px_rgba(245,158,11,0.35)]",
  en_proceso: "shadow-[0_0_14px_rgba(14,165,233,0.35)]",
  resuelto: "shadow-[0_0_14px_rgba(16,185,129,0.35)]",
};

export const ESTADO_RECLAMO_ETIQUETA: Record<EstadoReclamo, string> = {
  registrado: "Registrado",
  en_proceso: "En proceso",
  resuelto: "Resuelto",
};

export function EstadoReclamoBadge({
  estado,
  neon = false,
}: {
  estado: EstadoReclamo;
  neon?: boolean;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(ESTADO_RECLAMO_ESTILO[estado], neon && ESTADO_RECLAMO_GLOW[estado])}
    >
      {ESTADO_RECLAMO_ETIQUETA[estado]}
    </Badge>
  );
}
