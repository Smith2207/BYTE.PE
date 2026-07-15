import { FileWarning } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaginacionAdmin } from "@/components/admin/paginacion-admin";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";
import { listarReclamos } from "@/lib/reclamos/store";
import type { EstadoReclamo } from "@/db/schema/enums";
import { EstadoReclamoBadge } from "./estado-reclamo-badge";
import { ReclamosFiltros } from "./reclamos-filtros";
import { ReclamoSheet } from "./reclamo-sheet";

export const metadata = { title: "Admin — Reclamos" };

const POR_PAGINA = 15;

export default async function AdminReclamosPage({
  searchParams,
}: {
  searchParams: { q?: string; estado?: string; pagina?: string };
}) {
  const todos = await listarReclamos();
  const q = searchParams.q?.trim().toLowerCase();
  const estado = searchParams.estado as EstadoReclamo | undefined;

  let reclamos = todos;
  if (q) {
    reclamos = reclamos.filter(
      (r) =>
        r.folio.toLowerCase().includes(q) ||
        r.nombre.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q),
    );
  }
  if (estado) {
    reclamos = reclamos.filter((r) => r.estado === estado);
  }

  const totalPaginas = Math.max(1, Math.ceil(reclamos.length / POR_PAGINA));
  const paginaActual = Math.min(Math.max(1, Number(searchParams.pagina) || 1), totalPaginas);
  const reclamosPagina = reclamos.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA,
  );

  const hayFiltros = Boolean(q || estado);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Libro de Reclamaciones</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {hayFiltros
            ? `${reclamos.length} resultado(s)`
            : "Reclamos y quejas registrados por clientes — obligatorio por INDECOPI."}
        </p>
      </div>

      {todos.length > 0 && <ReclamosFiltros />}

      {todos.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no se registró ningún reclamo.</p>
      ) : reclamos.length === 0 ? (
        <RevealOnScroll className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-20 text-center">
          <FileWarning className="size-10 text-muted-foreground" />
          <p className="mt-4 text-sm font-semibold">Sin reclamos para estos filtros</p>
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
                  <TableHead>Folio</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reclamosPagina.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-sm font-medium">{r.folio}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {r.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {r.nombre} {r.apellidos}
                      <p className="text-xs text-muted-foreground">{r.email}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString("es-PE")}
                    </TableCell>
                    <TableCell>
                      <EstadoReclamoBadge estado={r.estado} neon />
                    </TableCell>
                    <TableCell className="text-right">
                      <ReclamoSheet
                        reclamo={r}
                        trigger={
                          <Button variant="outline" size="sm">
                            {r.estado === "resuelto" ? "Ver" : "Responder"}
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
            basePath="/admin/reclamos"
            searchParams={searchParams}
          />
        </>
      )}
    </div>
  );
}
