import { adminListarCupones } from "@/lib/cupones/store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatoPEN } from "@/lib/format";
import { CuponDialog } from "./cupon-dialog";
import { ToggleActivoCupon, EliminarCuponBoton } from "./cupon-acciones";

export const metadata = { title: "Admin — Cupones" };

const nombreTipo = {
  porcentaje: "Porcentaje",
  monto_fijo: "Monto fijo",
  envio_gratis: "Envío gratis",
};

export default async function AdminCuponesPage() {
  const cupones = await adminListarCupones();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Cupones</h1>
        <CuponDialog />
      </div>

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
    </div>
  );
}
