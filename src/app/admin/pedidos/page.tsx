import { PackageSearch } from "lucide-react";

import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaginacionAdmin } from "@/components/admin/paginacion-admin";
import { listarPedidos, type PedidoMock } from "@/lib/pedidos/store";
import { PedidoFila } from "./pedido-fila";
import { PedidosFiltros } from "./pedidos-filtros";

export const metadata = { title: "Admin — Pedidos" };

const POR_PAGINA = 15;

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: { q?: string; estado?: string; pagina?: string };
}) {
  const todos = await listarPedidos();
  const q = searchParams.q?.trim().toLowerCase();
  const estado = searchParams.estado as PedidoMock["estado"] | undefined;

  let pedidos = todos;
  if (q) {
    pedidos = pedidos.filter(
      (p) =>
        p.numeroPedido.toLowerCase().includes(q) ||
        p.nombreComprador.toLowerCase().includes(q) ||
        p.emailComprador.toLowerCase().includes(q),
    );
  }
  if (estado) {
    pedidos = pedidos.filter((p) => p.estado === estado);
  }

  const totalPaginas = Math.max(1, Math.ceil(pedidos.length / POR_PAGINA));
  const paginaActual = Math.min(Math.max(1, Number(searchParams.pagina) || 1), totalPaginas);
  const pedidosPagina = pedidos.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA,
  );

  const hayFiltros = Boolean(q || estado);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Pedidos</h1>
        {hayFiltros && (
          <p className="mt-1 text-sm text-muted-foreground">
            {pedidos.length} resultado(s)
          </p>
        )}
      </div>

      <PedidosFiltros />

      {todos.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no hay pedidos registrados.</p>
      ) : pedidos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-20 text-center">
          <PackageSearch className="size-10 text-muted-foreground" />
          <p className="mt-4 text-sm font-semibold">Sin pedidos para estos filtros</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Prueba con otro término de búsqueda o estado.
          </p>
        </div>
      ) : (
        <>
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
                {pedidosPagina.map((p) => (
                  <PedidoFila key={p.numeroPedido} pedido={p} />
                ))}
              </TableBody>
            </Table>
          </div>
          <PaginacionAdmin
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            basePath="/admin/pedidos"
            searchParams={searchParams}
          />
        </>
      )}
    </div>
  );
}
