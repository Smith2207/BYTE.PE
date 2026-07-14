import Link from "next/link";
import { Receipt } from "lucide-react";
import { auth } from "@/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listarPedidosPorUsuario } from "@/lib/pedidos/store";
import { formatoPEN } from "@/lib/format";

export const metadata = { title: "Mis pedidos" };

export default async function CuentaPedidosPage() {
  const session = await auth();
  const pedidos = session?.user?.id ? await listarPedidosPorUsuario(session.user.id) : [];

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-bold">Mis pedidos</h1>

      {pedidos.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no tienes pedidos.</p>
      ) : (
        <div className="space-y-4">
          {pedidos.map((p) => (
            <Card key={p.numeroPedido}>
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
                  <Badge variant="outline" className="capitalize">
                    {p.estado}
                  </Badge>
                  <span className="font-semibold">{formatoPEN(p.total)}</span>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/pedido/${p.numeroPedido}/boleta`}>
                      <Receipt className="size-4" /> Boleta
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
