import { Wallet } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CardContent } from "@/components/ui/card";
import { SpotlightCard } from "@/components/fx/spotlight-card";
import { PaginacionAdmin } from "@/components/admin/paginacion-admin";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";
import { Magnetic } from "@/components/fx/magnetic";
import { GastosChart, type GastoPorMes } from "@/components/admin/gastos-chart";
import { listarGastos } from "@/lib/gastos/store";
import { formatoPEN } from "@/lib/format";
import type { CategoriaGasto } from "@/db/schema/enums";
import { CategoriaGastoBadge } from "./categoria-gasto";
import { GastosFiltros } from "./gastos-filtros";
import { GastoDialog } from "./gasto-dialog";
import { EliminarGastoBoton } from "./eliminar-boton";

export const metadata = { title: "Admin — Gastos" };

const POR_PAGINA = 15;

export default async function AdminGastosPage({
  searchParams,
}: {
  searchParams: { q?: string; categoria?: string; pagina?: string };
}) {
  const todos = await listarGastos();
  const q = searchParams.q?.trim().toLowerCase();
  const categoria = searchParams.categoria as CategoriaGasto | undefined;

  let gastos = todos;
  if (q) {
    gastos = gastos.filter((g) => g.descripcion.toLowerCase().includes(q));
  }
  if (categoria) {
    gastos = gastos.filter((g) => g.categoria === categoria);
  }

  const totalPaginas = Math.max(1, Math.ceil(gastos.length / POR_PAGINA));
  const paginaActual = Math.min(Math.max(1, Number(searchParams.pagina) || 1), totalPaginas);
  const gastosPagina = gastos.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  const totalFiltrado = gastos.reduce((acc, g) => acc + g.monto, 0);
  const hayFiltros = Boolean(q || categoria);

  // Gasto total por mes, últimos 6 meses — sobre TODOS los gastos (no
  // filtrados), es la tendencia general del negocio, no de la búsqueda.
  const gastosPorMesMap = new Map<string, number>();
  for (const g of todos) {
    const clave = g.fecha.slice(0, 7); // "YYYY-MM"
    gastosPorMesMap.set(clave, (gastosPorMesMap.get(clave) ?? 0) + g.monto);
  }
  const gastosPorMes: GastoPorMes[] = Array.from({ length: 6 }, (_, i) => {
    const fecha = new Date();
    fecha.setMonth(fecha.getMonth() - (5 - i));
    const clave = fecha.toISOString().slice(0, 7);
    return {
      mes: clave,
      etiqueta: fecha.toLocaleDateString("es-PE", { month: "short", year: "2-digit" }),
      total: gastosPorMesMap.get(clave) ?? 0,
    };
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Gastos operativos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {hayFiltros
              ? `${gastos.length} resultado(s) — ${formatoPEN(totalFiltrado)}`
              : `${todos.length} gasto(s) registrado(s) — ${formatoPEN(totalFiltrado)} en total`}
          </p>
        </div>
        <Magnetic strength={0.15} className="inline-block">
          <GastoDialog />
        </Magnetic>
      </div>

      {todos.length > 0 && (
        <SpotlightCard className="mb-6">
          <CardContent className="pt-6">
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
              Gasto mensual (últimos 6 meses)
            </h2>
            <GastosChart datos={gastosPorMes} />
          </CardContent>
        </SpotlightCard>
      )}

      {todos.length > 0 && <GastosFiltros />}

      {todos.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Todavía no registraste gastos operativos (alquiler, marketing, sueldos...).
        </p>
      ) : gastos.length === 0 ? (
        <RevealOnScroll className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-20 text-center">
          <Wallet className="size-10 text-muted-foreground" />
          <p className="mt-4 text-sm font-semibold">Sin gastos para estos filtros</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Prueba con otro término de búsqueda o categoría.
          </p>
        </RevealOnScroll>
      ) : (
        <>
          <RevealOnScroll y={16} className="overflow-x-auto rounded-2xl border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gastosPagina.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell className="text-muted-foreground">
                      {new Date(g.fecha).toLocaleDateString("es-PE")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {g.descripcion}
                      {g.notas && <p className="text-xs font-normal text-muted-foreground">{g.notas}</p>}
                    </TableCell>
                    <TableCell>
                      <CategoriaGastoBadge categoria={g.categoria} />
                    </TableCell>
                    <TableCell className="font-semibold">{formatoPEN(g.monto)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <GastoDialog gasto={g} />
                        <EliminarGastoBoton id={g.id} descripcion={g.descripcion} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </RevealOnScroll>
          <PaginacionAdmin
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            basePath="/admin/gastos"
            searchParams={searchParams}
          />
        </>
      )}
    </div>
  );
}
