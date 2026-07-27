import { MessageSquareText, BadgeCheck } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaginacionAdmin } from "@/components/admin/paginacion-admin";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";
import { adminListarResenas } from "@/lib/resenas/store";
import type { EstadoResena } from "@/db/schema/enums";
import { EstadoResenaBadge } from "./estado-resena-badge";
import { ResenasFiltros } from "./resenas-filtros";
import { ResenaAcciones } from "./resena-acciones";

export const metadata = { title: "Admin — Reseñas" };

const POR_PAGINA = 15;

export default async function AdminResenasPage({
  searchParams,
}: {
  searchParams: { q?: string; estado?: string; pagina?: string };
}) {
  const todas = await adminListarResenas();
  const q = searchParams.q?.trim().toLowerCase();
  const estado = searchParams.estado as EstadoResena | undefined;

  let resenas = todas;
  if (q) {
    resenas = resenas.filter(
      (r) =>
        r.productoNombre.toLowerCase().includes(q) || r.usuarioNombre.toLowerCase().includes(q),
    );
  }
  if (estado) {
    resenas = resenas.filter((r) => r.estado === estado);
  }

  const totalPaginas = Math.max(1, Math.ceil(resenas.length / POR_PAGINA));
  const paginaActual = Math.min(Math.max(1, Number(searchParams.pagina) || 1), totalPaginas);
  const resenasPagina = resenas.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  const hayFiltros = Boolean(q || estado);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Reseñas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {hayFiltros
            ? `${resenas.length} resultado(s)`
            : "Moderación de reseñas de producto — quedan pendientes hasta aprobarlas."}
        </p>
      </div>

      {todas.length > 0 && <ResenasFiltros />}

      {todas.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no hay reseñas.</p>
      ) : resenas.length === 0 ? (
        <RevealOnScroll className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-20 text-center">
          <MessageSquareText className="size-10 text-muted-foreground" />
          <p className="mt-4 text-sm font-semibold">Sin reseñas para estos filtros</p>
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
                  <TableHead>Producto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Calificación</TableHead>
                  <TableHead>Comentario</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resenasPagina.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="max-w-[160px] truncate font-medium">{r.productoNombre}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5">
                        {r.usuarioNombre}
                        {r.compraVerificada && (
                          <BadgeCheck className="size-3.5 shrink-0 text-emerald-500" aria-label="Compra verificada" />
                        )}
                      </span>
                    </TableCell>
                    <TableCell>{r.calificacion} / 5</TableCell>
                    <TableCell className="max-w-[280px] truncate text-muted-foreground">
                      {r.comentario}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString("es-PE")}
                    </TableCell>
                    <TableCell>
                      <EstadoResenaBadge estado={r.estado} neon />
                    </TableCell>
                    <TableCell className="text-right">
                      <ResenaAcciones id={r.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </RevealOnScroll>
          <PaginacionAdmin
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            basePath="/admin/resenas"
            searchParams={searchParams}
          />
        </>
      )}
    </div>
  );
}
