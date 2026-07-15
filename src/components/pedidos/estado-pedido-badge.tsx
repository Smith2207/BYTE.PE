import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PedidoMock } from "@/lib/pedidos/store";

/**
 * Un solo mapa de color por estado, reutilizado en /admin/pedidos y en
 * /cuenta/pedidos — mismo verde para "pagado/entregado" en cualquier
 * tabla del sitio, no colores distintos según la pantalla.
 */
export const ESTADO_PEDIDO_ESTILO: Record<PedidoMock["estado"], string> = {
  pendiente: "border-amber-500/30 bg-amber-500/10 text-amber-500",
  pagado: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  preparando: "border-sky-500/30 bg-sky-500/10 text-sky-500",
  enviado: "border-sky-500/30 bg-sky-500/10 text-sky-500",
  entregado: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  cancelado: "border-red-500/30 bg-red-500/10 text-red-500",
  reembolsado: "border-violet-500/30 bg-violet-500/10 text-violet-500",
};

// Mismo color que ESTADO_PEDIDO_ESTILO, solo como sombra — para el efecto
// "neon" de la consola admin (ver /admin/pedidos). No se usa en
// /cuenta/pedidos: ahí el badge se queda plano, sin glow.
export const ESTADO_PEDIDO_GLOW: Record<PedidoMock["estado"], string> = {
  pendiente: "shadow-[0_0_14px_rgba(245,158,11,0.35)]",
  pagado: "shadow-[0_0_14px_rgba(16,185,129,0.35)]",
  preparando: "shadow-[0_0_14px_rgba(14,165,233,0.35)]",
  enviado: "shadow-[0_0_14px_rgba(14,165,233,0.35)]",
  entregado: "shadow-[0_0_14px_rgba(16,185,129,0.35)]",
  cancelado: "shadow-[0_0_14px_rgba(239,68,68,0.35)]",
  reembolsado: "shadow-[0_0_14px_rgba(139,92,246,0.35)]",
};

export const ESTADO_PEDIDO_ETIQUETA: Record<PedidoMock["estado"], string> = {
  pendiente: "Pendiente",
  pagado: "Pagado",
  preparando: "Preparando",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
  reembolsado: "Reembolsado",
};

export function EstadoPedidoBadge({
  estado,
  neon = false,
}: {
  estado: PedidoMock["estado"];
  /** Glow del mismo color del estado — solo para la consola admin. */
  neon?: boolean;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(ESTADO_PEDIDO_ESTILO[estado], neon && ESTADO_PEDIDO_GLOW[estado])}
    >
      {ESTADO_PEDIDO_ETIQUETA[estado]}
    </Badge>
  );
}
