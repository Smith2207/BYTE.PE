"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatoPEN } from "@/lib/format";
import { previsualizarCostosFinalesAction, confirmarRecepcionCompraAction } from "./actions";

export function ConfirmarRecepcionDialog({
  compraId,
  open,
  onOpenChange,
  onConfirmado,
}: {
  compraId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmado: () => void;
}) {
  const [cargando, setCargando] = React.useState(true);
  const [guardando, setGuardando] = React.useState(false);
  const [items, setItems] = React.useState<
    {
      itemId: string;
      descripcion: string;
      cantidad: number;
      productoId: string | null;
      costoFinal: number;
      precioVenta: string;
    }[]
  >([]);

  React.useEffect(() => {
    if (!open) return;
    setCargando(true);
    previsualizarCostosFinalesAction(compraId)
      .then((datos) => {
        setItems(
          datos.map((d) => ({
            itemId: d.itemId,
            descripcion: d.descripcion,
            cantidad: d.cantidad,
            productoId: d.productoId,
            costoFinal: d.costoFinal,
            precioVenta: String(d.precioVentaActual ?? d.precioSugerido),
          })),
        );
      })
      .catch(() => toast.error("No se pudieron calcular los costos finales"))
      .finally(() => setCargando(false));
  }, [open, compraId]);

  const itemsNuevos = items.filter((i) => i.productoId === null);

  async function onConfirmar() {
    const precios = itemsNuevos
      .map((i) => ({ itemId: i.itemId, precioVenta: Number(i.precioVenta) }))
      .filter((p) => p.precioVenta > 0);

    if (precios.length < itemsNuevos.length) {
      toast.error("Todos los productos nuevos necesitan un precio de venta mayor a 0");
      return;
    }

    setGuardando(true);
    try {
      await confirmarRecepcionCompraAction(compraId, precios);
      toast.success("Compra recibida: stock y precios de venta actualizados");
      onOpenChange(false);
      onConfirmado();
    } catch {
      toast.error("No se pudo confirmar la recepción");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar recepción</DialogTitle>
          <DialogDescription>
            Con el envío/aduana ya repartido, este es el costo final real de cada producto nuevo.
            Ajusta el precio de venta sugerido si quieres.
          </DialogDescription>
        </DialogHeader>

        {cargando ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : itemsNuevos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay productos nuevos por publicar en esta compra — solo se actualizará el stock de
            los productos existentes.
          </p>
        ) : (
          <div className="space-y-4">
            {itemsNuevos.map((item) => (
              <div key={item.itemId} className="space-y-1.5 rounded-lg border border-border/60 p-3">
                <p className="text-sm font-medium">
                  {item.cantidad}x {item.descripcion}
                </p>
                <p className="text-xs text-muted-foreground">
                  Costo final por unidad: {formatoPEN(item.costoFinal)}
                </p>
                <div>
                  <Label htmlFor={`precio-${item.itemId}`} className="text-xs">
                    Precio de venta (S/)
                  </Label>
                  <Input
                    id={`precio-${item.itemId}`}
                    type="number"
                    step="0.01"
                    min="0"
                    className="mt-1"
                    value={item.precioVenta}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((i) =>
                          i.itemId === item.itemId ? { ...i, precioVenta: e.target.value } : i,
                        ),
                      )
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={guardando}>
            Cancelar
          </Button>
          <Button onClick={onConfirmar} disabled={cargando || guardando}>
            {guardando ? <Loader2 className="size-4 animate-spin" /> : "Confirmar recepción"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
