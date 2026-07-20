"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, MapPin, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { formatoPEN } from "@/lib/format";
import { departamentosPeru } from "@/lib/peru-data";
import type { CourierAlmacenado, TarifaCourierAlmacenada } from "@/lib/couriers/store";
import { crearTarifasCourierLoteAction, eliminarTarifaCourierAction } from "./actions";

export function TarifasSheet({
  courier,
  tarifas,
}: {
  courier: CourierAlmacenado;
  tarifas: TarifaCourierAlmacenada[];
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [guardando, setGuardando] = React.useState(false);
  const [seleccionados, setSeleccionados] = React.useState<string[]>([]);
  const [costo, setCosto] = React.useState("");
  const [diasMin, setDiasMin] = React.useState("2");
  const [diasMax, setDiasMax] = React.useState("5");

  const departamentosDisponibles = departamentosPeru.filter(
    (d) => !tarifas.some((t) => t.departamento === d),
  );
  const todosSeleccionados =
    departamentosDisponibles.length > 0 && seleccionados.length === departamentosDisponibles.length;

  function alternarDepartamento(d: string, marcado: boolean) {
    setSeleccionados((prev) => (marcado ? [...prev, d] : prev.filter((x) => x !== d)));
  }

  function alternarTodos(marcado: boolean) {
    setSeleccionados(marcado ? departamentosDisponibles : []);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    try {
      await crearTarifasCourierLoteAction({
        courierId: courier.id,
        departamentos: seleccionados,
        costo: Number(costo),
        diasEstimadosMin: Number(diasMin),
        diasEstimadosMax: Number(diasMax),
      });
      toast.success(
        seleccionados.length === 1 ? "Tarifa agregada" : `${seleccionados.length} tarifas agregadas`,
      );
      setSeleccionados([]);
      setCosto("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar la tarifa");
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(id: string) {
    try {
      await eliminarTarifaCourierAction(id);
      toast.success("Tarifa eliminada");
      router.refresh();
    } catch {
      toast.error("No se pudo eliminar la tarifa");
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <MapPin className="size-4" /> Tarifas ({tarifas.length})
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Tarifas — {courier.nombre}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-2">
          {tarifas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todavía no hay tarifas guardadas para este courier.
            </p>
          ) : (
            tarifas.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{t.departamento}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.diasEstimadosMin}-{t.diasEstimadosMax} días hábiles
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{formatoPEN(t.costo)}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => eliminar(t.id)}
                    aria-label="Eliminar tarifa"
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <Separator className="my-6" />

        <form onSubmit={onSubmit} className="space-y-4">
          <p className="text-sm font-semibold">Agregar tarifa</p>
          {departamentosDisponibles.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ya hay tarifa para los {tarifas.length} departamentos.
            </p>
          ) : (
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label>Departamentos</Label>
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Checkbox
                    checked={todosSeleccionados}
                    onCheckedChange={(v) => alternarTodos(Boolean(v))}
                  />
                  Seleccionar todos ({departamentosDisponibles.length})
                </label>
              </div>
              <div className="grid max-h-48 grid-cols-2 gap-x-3 gap-y-2 overflow-y-auto rounded-lg border border-border/60 p-3">
                {departamentosDisponibles.map((d) => (
                  <label key={d} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={seleccionados.includes(d)}
                      onCheckedChange={(v) => alternarDepartamento(d, Boolean(v))}
                    />
                    {d}
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="costo">Costo (S/)</Label>
              <Input
                id="costo"
                type="number"
                step="0.01"
                min="0"
                className="mt-1.5"
                required
                value={costo}
                onChange={(e) => setCosto(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="diasMin">Días mín.</Label>
              <Input
                id="diasMin"
                type="number"
                min="0"
                className="mt-1.5"
                value={diasMin}
                onChange={(e) => setDiasMin(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="diasMax">Días máx.</Label>
              <Input
                id="diasMax"
                type="number"
                min="0"
                className="mt-1.5"
                value={diasMax}
                onChange={(e) => setDiasMax(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" disabled={guardando || seleccionados.length === 0} className="w-full">
            {guardando ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {seleccionados.length > 1 ? `Agregar ${seleccionados.length} tarifas` : "Agregar tarifa"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
