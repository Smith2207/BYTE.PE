"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { GastoAlmacenado } from "@/lib/gastos/store";
import { CATEGORIA_GASTO_ETIQUETA } from "./categoria-gasto";
import { crearGastoAction, actualizarGastoAction } from "./actions";

export function GastoDialog({ gasto }: { gasto?: GastoAlmacenado }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [guardando, setGuardando] = React.useState(false);
  const [form, setForm] = React.useState({
    categoria: gasto?.categoria ?? "otros",
    descripcion: gasto?.descripcion ?? "",
    monto: gasto?.monto?.toString() ?? "",
    fecha: gasto?.fecha.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    comprobanteUrl: gasto?.comprobanteUrl ?? "",
    notas: gasto?.notas ?? "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    try {
      const input = {
        categoria: form.categoria as GastoAlmacenado["categoria"],
        descripcion: form.descripcion,
        monto: Number(form.monto),
        fecha: form.fecha,
        comprobanteUrl: form.comprobanteUrl || undefined,
        notas: form.notas || undefined,
      };
      if (gasto) {
        await actualizarGastoAction(gasto.id, input);
        toast.success("Gasto actualizado");
      } else {
        await crearGastoAction(input);
        toast.success("Gasto registrado");
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar el gasto");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {gasto ? (
          <Button variant="ghost" size="icon" aria-label="Editar gasto">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" /> Nuevo gasto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{gasto ? "Editar gasto" : "Nuevo gasto"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="categoria">Categoría</Label>
              <Select
                value={form.categoria}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, categoria: v as GastoAlmacenado["categoria"] }))
                }
              >
                <SelectTrigger id="categoria" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORIA_GASTO_ETIQUETA).map(([valor, etiqueta]) => (
                    <SelectItem key={valor} value={valor}>
                      {etiqueta}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                className="mt-1.5"
                required
                value={form.fecha}
                onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                className="mt-1.5"
                required
                placeholder="Ej: Alquiler del local — julio"
                value={form.descripcion}
                onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="monto">Monto (S/)</Label>
              <Input
                id="monto"
                type="number"
                step="0.01"
                min="0"
                className="mt-1.5"
                required
                value={form.monto}
                onChange={(e) => setForm((f) => ({ ...f, monto: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="comprobanteUrl">Enlace al comprobante (opcional)</Label>
              <Input
                id="comprobanteUrl"
                className="mt-1.5"
                placeholder="https://..."
                value={form.comprobanteUrl}
                onChange={(e) => setForm((f) => ({ ...f, comprobanteUrl: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="notas">Notas (opcional)</Label>
              <Textarea
                id="notas"
                className="mt-1.5"
                rows={2}
                value={form.notas}
                onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))}
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
