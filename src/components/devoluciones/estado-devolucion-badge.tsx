import { Badge } from "@/components/ui/badge";
import type { EstadoDevolucion } from "@/db/schema/enums";

/** Compartido entre /admin/devoluciones y /cuenta/pedidos — mismo color
 * de estado en cualquier pantalla del sitio. */
export const ESTADO_DEVOLUCION_ESTILO: Record<EstadoDevolucion, string> = {
  pendiente: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  aprobada: "border-sky-500/30 bg-sky-500/10 text-sky-500",
  rechazada: "border-red-500/30 bg-red-500/10 text-red-500",
  completada: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
};

export const ESTADO_DEVOLUCION_ETIQUETA: Record<EstadoDevolucion, string> = {
  pendiente: "En revisión",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
  completada: "Completada",
};

export function EstadoDevolucionBadge({ estado }: { estado: EstadoDevolucion }) {
  return (
    <Badge variant="outline" className={ESTADO_DEVOLUCION_ESTILO[estado]}>
      {ESTADO_DEVOLUCION_ETIQUETA[estado]}
    </Badge>
  );
}
