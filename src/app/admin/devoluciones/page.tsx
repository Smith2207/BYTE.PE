import { Undo2 } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaginacionAdmin } from "@/components/admin/paginacion-admin";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";
import { listarSolicitudesDevolucion } from "@/lib/devoluciones/store";
import { formatoPEN } from "@/lib/format";
import type { EstadoDevolucion } from "@/db/schema/enums";
import { EstadoDevolucionBadge } from "@/components/devoluciones/estado-devolucion-badge";
import { DevolucionesFiltros } from "./devoluciones-filtros";
import { DevolucionSheet } from "./devolucion-sheet";

export const metadata = { title: "Admin — Devoluciones" };

const POR_PAGINA = 15;

export default async function AdminDevolucionesPage({
  searchParams,
}: {
  searchParams: { q?: string; estado?: string; pagina?: string };
}) {
  const todas = await listarSolicitudesDevolucion();
  const q = searchParams.q?.trim().toLowerCase();
  const estado = searchParams.estado as EstadoDevolucion | undefined;

  let solicitudes = todas;
  if (q) {
    solicitudes = solicitudes.filter((s) => s.pedidoNumero.toLowerCase().includes(q));
  }
  if (estado) {
    solicitudes = solicitudes.filter((s) => s.estado === estado);
  }

  const totalPaginas = Math.max(1, Math.ceil(solicitudes.length / POR_PAGINA));
  const paginaActual = Math.min(Math.max(1, Number(searchParams.pagina) || 1), totalPaginas);
  const solicitudesPagina = solicitudes.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA,
  );

  const hayFiltros = Boolean(q || estado);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Devoluciones y reembolsos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {hayFiltros
            ? `${solicitudes.length} resultado(s)`
            : "Solicitudes de devolución sobre pedidos ya entregados."}
        </p>
      </div>

      {todas.length > 0 && <DevolucionesFiltros />}

      {todas.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no se registró ninguna solicitud.</p>
      ) : solicitudes.length === 0 ? (
        <RevealOnScroll className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-20 text-center">
          <Undo2 className="size-10 text-muted-foreground" />
          <p className="mt-4 text-sm font-semibold">Sin solicitudes para estos filtros</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Prueba con otro término de búsqueda o estado.
          </p>
        </RevealOnScroll>
      ) : (
        <>
          <RevealOnScroll y={16} className="overflow-x-auto rounded-2xl border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Monto pedido</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {solicitudesPagina.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-sm font-medium">{s.pedidoNumero}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {s.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatoPEN(s.pedidoTotal)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(s.createdAt).toLocaleDateString("es-PE")}
                    </TableCell>
                    <TableCell>
                      <EstadoDevolucionBadge estado={s.estado} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DevolucionSheet
                        solicitud={s}
                        trigger={
                          <Button variant="outline" size="sm">
                            {s.estado === "pendiente" || s.estado === "aprobada" ? "Gestionar" : "Ver"}
                          </Button>
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </RevealOnScroll>
          <PaginacionAdmin
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            basePath="/admin/devoluciones"
            searchParams={searchParams}
          />
        </>
      )}
    </div>
  );
}
