import Link from "next/link";
import { Receipt } from "lucide-react";
import { auth } from "@/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EstadoPedidoBadge } from "@/components/pedidos/estado-pedido-badge";
import { EstadoDevolucionBadge } from "@/components/devoluciones/estado-devolucion-badge";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";
import { ELASTIC_EASE, STAGGER_MAX } from "@/lib/motion";
import { listarPedidosPorUsuario } from "@/lib/pedidos/store";
import { listarSolicitudesPorUsuario } from "@/lib/devoluciones/store";
import { formatoPEN } from "@/lib/format";
import { SolicitarDevolucionDialog } from "./solicitar-devolucion-dialog";

export const metadata = { title: "Mis pedidos" };

export default async function CuentaPedidosPage() {
  const session = await auth();
  let pedidos: Awaited<ReturnType<typeof listarPedidosPorUsuario>> = [];
  let solicitudes: Awaited<ReturnType<typeof listarSolicitudesPorUsuario>> = [];
  if (session?.user?.id) {
    [pedidos, solicitudes] = await Promise.all([
      listarPedidosPorUsuario(session.user.id),
      listarSolicitudesPorUsuario(session.user.id),
    ]);
  }
  const solicitudPorPedidoId = new Map(solicitudes.map((s) => [s.pedidoId, s]));

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-bold">Mis pedidos</h1>

      {pedidos.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no tienes pedidos.</p>
      ) : (
        <RevealOnScroll
          className="space-y-4"
          selector="[data-pedido-card]"
          stagger={STAGGER_MAX}
          ease={ELASTIC_EASE}
          y={20}
        >
          {pedidos.map((p) => {
            const solicitud = solicitudPorPedidoId.get(p.id);
            return (
              <Card
                key={p.numeroPedido}
                data-pedido-card
                className="border-border bg-card/80 backdrop-blur-lg"
              >
                <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
                  <div>
                    <Link href={`/pedido/${p.numeroPedido}`} className="font-mono text-sm font-semibold hover:underline">
                      {p.numeroPedido}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {new Date(p.createdAt).toLocaleDateString("es-PE")} · {p.items.length} producto(s)
                    </p>
                    {p.numeroTracking && (
                      <p className="text-xs text-muted-foreground">
                        {p.courier} — tracking {p.numeroTracking}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <EstadoPedidoBadge estado={p.estado} />
                    <span className="font-mono font-semibold">{formatoPEN(p.total)}</span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/pedido/${p.numeroPedido}/boleta`}>
                        <Receipt className="size-4" /> Boleta
                      </Link>
                    </Button>
                    {solicitud ? (
                      <EstadoDevolucionBadge estado={solicitud.estado} />
                    ) : (
                      p.estado === "entregado" && (
                        <SolicitarDevolucionDialog numeroPedido={p.numeroPedido} />
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </RevealOnScroll>
      )}
    </div>
  );
}
