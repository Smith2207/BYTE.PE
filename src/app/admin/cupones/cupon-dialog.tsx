"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CuponAlmacenado } from "@/lib/cupones/store";
import { crearCuponAction, actualizarCuponAction } from "./actions";

function aInputDate(iso: string) {
  return iso.slice(0, 10);
}

/** Vigencia por 90 días — antes era un string fijo ("2026-12-31") que se
 * iba a volver una fecha vencida/absurda apenas pasara esa fecha, sin que
 * nadie lo notara. */
function fechaFinPorDefecto() {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + 90);
  return fecha.toISOString().slice(0, 10);
}

export function CuponDialog({ cupon }: { cupon?: CuponAlmacenado }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [guardando, setGuardando] = React.useState(false);
  const [form, setForm] = React.useState({
    codigo: cupon?.codigo ?? "",
    tipo: cupon?.tipo ?? "porcentaje",
    valor: cupon?.valor?.toString() ?? "10",
    montoMinimoCompra: cupon?.montoMinimoCompra?.toString() ?? "0",
    fechaInicio: cupon ? aInputDate(cupon.fechaInicio) : new Date().toISOString().slice(0, 10),
    fechaFin: cupon ? aInputDate(cupon.fechaFin) : fechaFinPorDefecto(),
    usosMaximos: cupon?.usosMaximos?.toString() ?? "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.tipo === "porcentaje" && Number(form.valor) > 100) {
      toast.error("Un descuento por porcentaje no puede ser mayor a 100%");
      return;
    }
    if (form.fechaFin < form.fechaInicio) {
      toast.error('"Vigente hasta" no puede ser antes que "Vigente desde"');
      return;
    }

    setGuardando(true);
    try {
      const input = {
        codigo: form.codigo,
        tipo: form.tipo as "porcentaje" | "monto_fijo" | "envio_gratis",
        valor: Number(form.valor),
        montoMinimoCompra: Number(form.montoMinimoCompra),
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
        usosMaximos: form.usosMaximos ? Number(form.usosMaximos) : null,
      };
      if (cupon) {
        await actualizarCuponAction(cupon.id, input);
        toast.success("Cupón actualizado");
      } else {
        await crearCuponAction(input);
        toast.success("Cupón creado");
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar el cupón");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {cupon ? (
          <Button variant="ghost" size="icon" aria-label="Editar cupón">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" /> Nuevo cupón
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{cupon ? "Editar cupón" : "Nuevo cupón"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                required
                className="mt-1.5 uppercase"
                value={form.codigo}
                onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value.toUpperCase() }))}
              />
            </div>
            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm((f) => ({ ...f, tipo: v as typeof form.tipo }))}>
                <SelectTrigger id="tipo" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="porcentaje">Porcentaje</SelectItem>
                  <SelectItem value="monto_fijo">Monto fijo</SelectItem>
                  <SelectItem value="envio_gratis">Envío gratis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.tipo !== "envio_gratis" && (
              <div>
                <Label htmlFor="valor">
                  Valor {form.tipo === "porcentaje" ? "(%)" : "(S/)"}
                </Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  max={form.tipo === "porcentaje" ? 100 : undefined}
                  className="mt-1.5"
                  value={form.valor}
                  onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
                />
              </div>
            )}
            <div>
              <Label htmlFor="montoMinimo">Compra mínima (S/)</Label>
              <Input
                id="montoMinimo"
                type="number"
                step="0.01"
                min="0"
                className="mt-1.5"
                value={form.montoMinimoCompra}
                onChange={(e) => setForm((f) => ({ ...f, montoMinimoCompra: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="fechaInicio">Vigente desde</Label>
              <Input
                id="fechaInicio"
                type="date"
                className="mt-1.5"
                value={form.fechaInicio}
                onChange={(e) => setForm((f) => ({ ...f, fechaInicio: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="fechaFin">Vigente hasta</Label>
              <Input
                id="fechaFin"
                type="date"
                className="mt-1.5"
                value={form.fechaFin}
                onChange={(e) => setForm((f) => ({ ...f, fechaFin: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="usosMaximos">Usos máximos (vacío = ilimitado)</Label>
              <Input
                id="usosMaximos"
                type="number"
                min="0"
                className="mt-1.5"
                value={form.usosMaximos}
                onChange={(e) => setForm((f) => ({ ...f, usosMaximos: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={guardando}>
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
