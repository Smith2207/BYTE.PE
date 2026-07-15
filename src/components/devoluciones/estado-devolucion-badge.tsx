import { crearBadgeDeEstado } from "@/components/ui/estado-badge-factory";
import type { EstadoDevolucion } from "@/db/schema/enums";

/** Compartido entre /admin/devoluciones y /cuenta/pedidos — mismo color
 * de estado en cualquier pantalla del sitio. */
export const ESTADO_DEVOLUCION_ESTILO: Record<EstadoDevolucion, string> = {
  pendiente: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  aprobada: "border-sky-500/30 bg-sky-500/10 text-sky-500",
  rechazada: "border-red-500/30 bg-red-500/10 text-red-500",
  completada: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
};

// Mismo color que ESTADO_DEVOLUCION_ESTILO, solo como sombra — glow
// "neon" exclusivo de la consola admin, no se usa en /cuenta/pedidos.
export const ESTADO_DEVOLUCION_GLOW: Record<EstadoDevolucion, string> = {
  pendiente: "shadow-[0_0_14px_rgba(245,158,11,0.35)]",
  aprobada: "shadow-[0_0_14px_rgba(14,165,233,0.35)]",
  rechazada: "shadow-[0_0_14px_rgba(239,68,68,0.35)]",
  completada: "shadow-[0_0_14px_rgba(16,185,129,0.35)]",
};

export const ESTADO_DEVOLUCION_ETIQUETA: Record<EstadoDevolucion, string> = {
  pendiente: "En revisión",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
  completada: "Completada",
};

/** El componente generado no tiene el prop `neon` opcional discriminado
 * por consumidor — funciona igual que antes: admin lo pasa en true,
 * /cuenta/pedidos no lo pasa (queda false por defecto). */
export const EstadoDevolucionBadge = crearBadgeDeEstado({
  estilos: ESTADO_DEVOLUCION_ESTILO,
  glows: ESTADO_DEVOLUCION_GLOW,
  etiquetas: ESTADO_DEVOLUCION_ETIQUETA,
});
