import { crearBadgeDeEstado } from "@/components/ui/estado-badge-factory";
import type { EstadoResena } from "@/db/schema/enums";

export const ESTADO_RESENA_ESTILO: Record<EstadoResena, string> = {
  pendiente: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  publicada: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  rechazada: "border-red-500/30 bg-red-500/10 text-red-500",
};

// Mismo color que ESTADO_RESENA_ESTILO, solo como sombra — mismo patrón
// "neon" que el resto de la consola admin (pedidos, reclamos...).
export const ESTADO_RESENA_GLOW: Record<EstadoResena, string> = {
  pendiente: "shadow-[0_0_14px_rgba(245,158,11,0.35)]",
  publicada: "shadow-[0_0_14px_rgba(16,185,129,0.35)]",
  rechazada: "shadow-[0_0_14px_rgba(239,68,68,0.35)]",
};

export const ESTADO_RESENA_ETIQUETA: Record<EstadoResena, string> = {
  pendiente: "Pendiente",
  publicada: "Publicada",
  rechazada: "Rechazada",
};

export const EstadoResenaBadge = crearBadgeDeEstado({
  estilos: ESTADO_RESENA_ESTILO,
  glows: ESTADO_RESENA_GLOW,
  etiquetas: ESTADO_RESENA_ETIQUETA,
});
