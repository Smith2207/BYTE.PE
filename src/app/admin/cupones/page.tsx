import { PackageSearch } from "lucide-react";
import { adminListarCupones } from "@/lib/cupones/store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatoPEN } from "@/lib/format";
import { CuponDialog } from "./cupon-dialog";
import { ToggleActivoCupon, EliminarCuponBoton } from "./cupon-acciones";
import { BuscarCuponInput } from "./buscar-cupon-input";

export const metadata = { title: "Admin — Cupones" };

const nombreTipo = {
  porcentaje: "Porcentaje",
  monto_fijo: "Monto fijo",
  envio_gratis: "Envío gratis",
};

export default async function AdminCuponesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const todos = await adminListarCupones();
  const q = searchParams.q?.trim().toLowerCase();
  const cupones = q ? todos.filter((c) => c.codigo.toLowerCase().includes(q)) : todos;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Cupones</h1>
          {q && (
            <p className="mt-1 text-sm text-muted-foreground">
              {cupones.length} resultado(s) para &quot;{q}&quot;
            </p>
          )}
        </div>
        <CuponDialog />
      </div>

      {todos.length > 1 && <BuscarCuponInput />}

      {cupones.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-20 text-center">
          <PackageSearch className="size-10 text-muted-foreground" />
          <p className="mt-4 text-sm font-semibold">Sin cupones para &quot;{q}&quot;</p>
        </div>
      ) : (
      <div className="overflow-hidden rounded-2xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Compra mín.</TableHead>
              <TableHead>Usos</TableHead>
              <TableHead>Vigencia</TableHead>
              <TableHead>Activo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cupones.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono font-medium">{c.codigo}</TableCell>
                <TableCell className="text-muted-foreground">{nombreTipo[c.tipo]}</TableCell>
                <TableCell>
                  {c.tipo === "envio_gratis"
                    ? "—"
                    : c.tipo === "porcentaje"
                      ? `${c.valor}%`
                      : formatoPEN(c.valor)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatoPEN(c.montoMinimoCompra)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {c.usosActuales}
                    {c.usosMaximos != null ? ` / ${c.usosMaximos}` : ""}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {c.fechaInicio.slice(0, 10)} — {c.fechaFin.slice(0, 10)}
                </TableCell>
                <TableCell>
                  <ToggleActivoCupon id={c.id} activo={c.activo} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <CuponDialog cupon={c} />
                    <EliminarCuponBoton id={c.id} codigo={c.codigo} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      )}
    </div>
  );
}
