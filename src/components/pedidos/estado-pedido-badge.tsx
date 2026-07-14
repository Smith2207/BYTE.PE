import { Badge } from "@/components/ui/badge";
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
};

export const ESTADO_PEDIDO_ETIQUETA: Record<PedidoMock["estado"], string> = {
  pendiente: "Pendiente",
  pagado: "Pagado",
  preparando: "Preparando",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export function EstadoPedidoBadge({ estado }: { estado: PedidoMock["estado"] }) {
  return (
    <Badge variant="outline" className={ESTADO_PEDIDO_ESTILO[estado]}>
      {ESTADO_PEDIDO_ETIQUETA[estado]}
    </Badge>
  );
}
