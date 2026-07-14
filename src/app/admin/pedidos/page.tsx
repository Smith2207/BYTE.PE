import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listarPedidos } from "@/lib/pedidos/store";
import { PedidoFila } from "./pedido-fila";

export const metadata = { title: "Admin — Pedidos" };

export default async function AdminPedidosPage() {
  const pedidos = await listarPedidos();

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-bold">Pedidos</h1>

      {pedidos.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no hay pedidos registrados.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Envío</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead className="text-right">Comprobante</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidos.map((p) => (
                <PedidoFila key={p.numeroPedido} pedido={p} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
