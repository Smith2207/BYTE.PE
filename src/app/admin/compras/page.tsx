import Link from "next/link";
import { AlertTriangle, PackageSearch, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaginacionAdmin } from "@/components/admin/paginacion-admin";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";
import { Magnetic } from "@/components/fx/magnetic";
import {
  listarCompras,
  nombreProveedor,
  contarComprasDelAnioSinImpuestos,
  type CompraAlmacenada,
} from "@/lib/compras/store";
import { formatoPEN } from "@/lib/format";
import { EstadoCompraSelector } from "./estado-selector";
import { ComprasFiltros, TIPO_ENVIO_ETIQUETA } from "./compras-filtros";

export const metadata = { title: "Admin — Compras" };

const POR_PAGINA = 15;
// Envíos de entrega rápida sin impuestos permitidos por persona al año —
// ajusta este número si la normativa de SUNAT cambia; esto solo te avisa,
// no bloquea nada.
const LIMITE_IMPORTACIONES_SIN_IMPUESTOS = 3;

export default async function AdminComprasPage({
  searchParams,
}: {
  searchParams: { q?: string; estado?: string; pagina?: string };
}) {
  const [todas, importacionesDelAnio] = await Promise.all([
    listarCompras(),
    contarComprasDelAnioSinImpuestos(),
  ]);
  const q = searchParams.q?.trim().toLowerCase();
  const estado = searchParams.estado as CompraAlmacenada["estado"] | undefined;

  let compras = todas;
  if (q) {
    compras = compras.filter(
      (c) =>
        nombreProveedor(c).toLowerCase().includes(q) ||
        c.numeroOrdenExterno?.toLowerCase().includes(q),
    );
  }
  if (estado) {
    compras = compras.filter((c) => c.estado === estado);
  }

  const totalPaginas = Math.max(1, Math.ceil(compras.length / POR_PAGINA));
  const paginaActual = Math.min(Math.max(1, Number(searchParams.pagina) || 1), totalPaginas);
  const comprasPagina = compras.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA,
  );

  const hayFiltros = Boolean(q || estado);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Compras e importaciones</h1>
          {hayFiltros && (
            <p className="mt-1 text-sm text-muted-foreground">
              {compras.length} resultado(s)
            </p>
          )}
        </div>
        <Magnetic strength={0.15} className="inline-block">
          <Button asChild>
            <Link href="/admin/compras/nueva">
              <Plus className="size-4" /> Nueva compra
            </Link>
          </Button>
        </Magnetic>
      </div>

      {todas.length > 0 && (
        <div
          className={`mb-4 flex items-start gap-2.5 rounded-xl border p-3 text-xs ${
            importacionesDelAnio >= LIMITE_IMPORTACIONES_SIN_IMPUESTOS
              ? "border-amber-500/30 bg-amber-500/5 text-foreground/70"
              : "border-border/60 bg-secondary/40 text-foreground/70"
          }`}
        >
          <AlertTriangle
            className={`mt-0.5 size-4 shrink-0 ${
              importacionesDelAnio >= LIMITE_IMPORTACIONES_SIN_IMPUESTOS
                ? "text-amber-500"
                : "text-muted-foreground"
            }`}
          />
          <span>
            Llevas <strong>{importacionesDelAnio}</strong> de{" "}
            <strong>{LIMITE_IMPORTACIONES_SIN_IMPUESTOS}</strong> importaciones sin impuestos
            este año.{" "}
            {importacionesDelAnio >= LIMITE_IMPORTACIONES_SIN_IMPUESTOS
              ? "Las siguientes probablemente paguen impuestos o convenga espaciarlas para no llamar la atención de aduanas."
              : "Es una referencia según lo que nos contaste — confirma el límite vigente con tu agente de aduana."}
          </span>
        </div>
      )}

      {todas.length > 0 && <ComprasFiltros />}

      {todas.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Todavía no registraste compras a proveedores.
        </p>
      ) : compras.length === 0 ? (
        <RevealOnScroll className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-20 text-center">
          <PackageSearch className="size-10 text-muted-foreground" />
          <p className="mt-4 text-sm font-semibold">Sin compras para estos filtros</p>
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
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Costo total</TableHead>
                  <TableHead>Impuestos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Detalle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comprasPagina.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      {nombreProveedor(c)}
                      <p className="mt-0.5 text-xs font-normal text-muted-foreground">
                        {TIPO_ENVIO_ETIQUETA[c.tipoEnvio]}
                        {c.numeroOrdenExterno && ` · ${c.numeroOrdenExterno}`}
                      </p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(c.fechaCompra).toLocaleDateString("es-PE")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.items.reduce((acc, i) => acc + i.cantidad, 0)} unid. ({c.items.length} línea/s)
                    </TableCell>
                    <TableCell className="font-semibold">{formatoPEN(c.costoTotal)}</TableCell>
                    <TableCell>
                      {c.pagoImpuestos ? (
                        <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-500">
                          {formatoPEN(c.montoImpuestos ?? 0)}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <EstadoCompraSelector
                        id={c.id}
                        estado={c.estado}
                        tipoEnvio={c.tipoEnvio}
                        tieneItemsNuevos={c.items.some((it) => it.productoId === null)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/compras/${c.id}`} className="text-sm text-primary hover:underline">
                        Ver
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </RevealOnScroll>
          <PaginacionAdmin
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            basePath="/admin/compras"
            searchParams={searchParams}
          />
        </>
      )}
    </div>
  );
}
