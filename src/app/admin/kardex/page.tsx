import { AlertTriangle, ClipboardList } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";
import { listarProductosParaKardex, obtenerKardexProducto } from "@/lib/kardex/store";
import { ProductoSelector } from "./producto-selector";
import { ExportarCsvBoton } from "./exportar-csv-boton";

export const metadata = { title: "Admin — Kardex" };

const ETIQUETA_TIPO: Record<string, string> = {
  compra: "Compra",
  venta: "Venta",
  devolucion: "Devolución",
};

const ESTILO_TIPO: Record<string, string> = {
  compra: "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
  venta: "border-sky-500/30 bg-sky-500/10 text-sky-500",
  devolucion: "border-violet-500/30 bg-violet-500/10 text-violet-500",
};

export default async function AdminKardexPage({
  searchParams,
}: {
  searchParams: { producto?: string };
}) {
  const productos = await listarProductosParaKardex();
  const productoSeleccionado = searchParams.producto
    ? productos.find((p) => p.id === searchParams.producto)
    : undefined;

  const kardex = searchParams.producto ? await obtenerKardexProducto(searchParams.producto) : null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Kardex</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Entradas, salidas y saldo de inventario por producto — a partir de compras recibidas,
          ventas y devoluciones ya registradas.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <ProductoSelector productos={productos} productoId={searchParams.producto} />
        {kardex && productoSeleccionado && (
          <ExportarCsvBoton movimientos={kardex.movimientos} nombreProducto={productoSeleccionado.nombre} />
        )}
      </div>

      {!searchParams.producto ? (
        <RevealOnScroll className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-20 text-center">
          <ClipboardList className="size-10 text-muted-foreground" />
          <p className="mt-4 text-sm font-semibold">Selecciona un producto</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Elige un producto arriba para ver su historial de movimientos.
          </p>
        </RevealOnScroll>
      ) : kardex && kardex.movimientos.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Este producto todavía no tiene compras, ventas ni devoluciones registradas.
        </p>
      ) : (
        kardex && (
          <>
            {kardex.saldoCalculado !== kardex.stockActual && (
              <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-foreground/70">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                <span>
                  El saldo calculado por movimientos ({kardex.saldoCalculado}) no coincide con el
                  stock actual del sistema ({kardex.stockActual}) — probablemente el stock se
                  ajustó manualmente en la ficha del producto en algún momento.
                </span>
              </div>
            )}
            <RevealOnScroll y={16} className="overflow-x-auto rounded-2xl border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead className="text-right">Entrada</TableHead>
                    <TableHead className="text-right">Salida</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kardex.movimientos.map((m, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-muted-foreground">
                        {new Date(m.fecha).toLocaleDateString("es-PE")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={ESTILO_TIPO[m.tipo]}>
                          {ETIQUETA_TIPO[m.tipo]}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{m.documento}</TableCell>
                      <TableCell className="text-right text-emerald-500">
                        {m.entrada > 0 ? `+${m.entrada}` : ""}
                      </TableCell>
                      <TableCell className="text-right text-red-500">
                        {m.salida > 0 ? `-${m.salida}` : ""}
                      </TableCell>
                      <TableCell className="text-right font-semibold">{m.saldo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </RevealOnScroll>
          </>
        )
      )}
    </div>
  );
}
