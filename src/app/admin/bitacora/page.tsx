import { ScrollText } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";
import { listarBitacora } from "@/lib/bitacora/store";

export const metadata = { title: "Admin — Bitácora" };

const ACCION_ETIQUETA: Record<string, string> = {
  cambiar_estado_pedido: "Cambió estado de pedido",
  eliminar_producto: "Eliminó producto",
  aprobar_devolucion: "Aprobó devolución",
  rechazar_devolucion: "Rechazó devolución",
  completar_reembolso: "Completó reembolso",
  moderar_resena: "Moderó reseña",
  crear_cupon: "Creó cupón",
  eliminar_cupon: "Eliminó cupón",
  confirmar_recepcion_compra: "Confirmó recepción de compra",
};

export default async function AdminBitacoraPage() {
  const entradas = await listarBitacora();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Bitácora de auditoría</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Registro de las acciones sensibles hechas desde este panel — quién y cuándo.
        </p>
      </div>

      {entradas.length === 0 ? (
        <RevealOnScroll className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-20 text-center">
          <ScrollText className="size-10 text-muted-foreground" />
          <p className="mt-4 text-sm font-semibold">Todavía no hay nada registrado</p>
        </RevealOnScroll>
      ) : (
        <RevealOnScroll y={16} className="overflow-x-auto rounded-2xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Quién</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Detalle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entradas.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {new Date(e.createdAt).toLocaleString("es-PE")}
                  </TableCell>
                  <TableCell className="font-medium">{e.usuarioNombre}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{ACCION_ETIQUETA[e.accion] ?? e.accion}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[360px] truncate font-mono text-xs text-muted-foreground">
                    {e.detalle ? JSON.stringify(e.detalle) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </RevealOnScroll>
      )}
    </div>
  );
}
