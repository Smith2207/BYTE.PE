"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MapPin, Plus, Star, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { departamentosPeru, getProvinciasDe, getDistritosDe } from "@/lib/peru-data";
import type { DireccionAlmacenada } from "@/lib/direcciones/store";
import {
  crearDireccionAction,
  eliminarDireccionAction,
  marcarDireccionPrincipalAction,
} from "./actions";

export function DireccionesLista({ direcciones }: { direcciones: DireccionAlmacenada[] }) {
  const router = useRouter();
  const [mostrarForm, setMostrarForm] = React.useState(direcciones.length === 0);
  const [form, setForm] = React.useState({
    departamento: "",
    provincia: "",
    distrito: "",
    direccionExacta: "",
    referencia: "",
    esPrincipal: direcciones.length === 0,
  });

  const provinciasDisponibles = React.useMemo(
    () => (form.departamento ? getProvinciasDe(form.departamento) : []),
    [form.departamento],
  );
  const distritosDisponibles = React.useMemo(
    () => (form.departamento && form.provincia ? getDistritosDe(form.departamento, form.provincia) : []),
    [form.departamento, form.provincia],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await crearDireccionAction(form);
      toast.success("Dirección guardada");
      setMostrarForm(false);
      setForm({
        departamento: "",
        provincia: "",
        distrito: "",
        direccionExacta: "",
        referencia: "",
        esPrincipal: false,
      });
      router.refresh();
    } catch {
      toast.error("No se pudo guardar la dirección");
    }
  }

  return (
    <div className="space-y-4">
      {direcciones.map((d) => (
        <Card key={d.id}>
          <CardContent className="flex items-start justify-between gap-3 pt-6">
            <div className="flex gap-3">
              <MapPin className="mt-0.5 size-5 text-primary" />
              <div className="text-sm">
                <p className="font-medium">
                  {d.distrito}, {d.provincia}
                  {d.esPrincipal && (
                    <span className="ml-2 inline-flex items-center gap-1 text-xs text-primary">
                      <Star className="size-3 fill-current" /> Principal
                    </span>
                  )}
                </p>
                <p className="text-muted-foreground">{d.departamento}</p>
                {d.direccionExacta && (
                  <p className="text-xs text-muted-foreground">{d.direccionExacta}</p>
                )}
                {d.referencia && <p className="text-xs text-muted-foreground">{d.referencia}</p>}
              </div>
            </div>
            <div className="flex gap-1">
              {!d.esPrincipal && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await marcarDireccionPrincipalAction(d.id);
                    router.refresh();
                  }}
                >
                  Marcar principal
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  await eliminarDireccionAction(d.id);
                  toast.success("Dirección eliminada");
                  router.refresh();
                }}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {mostrarForm ? (
        <Card>
          <CardContent className="pt-6">
            <p className="mb-1 text-xs text-muted-foreground sm:col-span-2">
              Por ahora no hacemos despacho a domicilio: el envío es por agencia a la oficina más
              cercana a tu distrito. La dirección exacta es solo una referencia opcional.
            </p>
            <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="departamento">Departamento</Label>
                <Select
                  value={form.departamento}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, departamento: v, provincia: "", distrito: "" }))
                  }
                >
                  <SelectTrigger id="departamento" className="mt-1.5">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {departamentosPeru.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="provincia">Provincia</Label>
                <Select
                  value={form.provincia}
                  disabled={!form.departamento}
                  onValueChange={(v) => setForm((f) => ({ ...f, provincia: v, distrito: "" }))}
                >
                  <SelectTrigger id="provincia" className="mt-1.5">
                    <SelectValue
                      placeholder={form.departamento ? "Selecciona" : "Elige un departamento primero"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {provinciasDisponibles.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="distrito">Distrito</Label>
                <Select
                  value={form.distrito}
                  disabled={!form.provincia}
                  onValueChange={(v) => setForm((f) => ({ ...f, distrito: v }))}
                >
                  <SelectTrigger id="distrito" className="mt-1.5">
                    <SelectValue
                      placeholder={form.provincia ? "Selecciona" : "Elige una provincia primero"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {distritosDisponibles.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="direccionExacta">Dirección exacta (opcional)</Label>
                <Input
                  id="direccionExacta"
                  className="mt-1.5"
                  placeholder="Referencial — recojo en agencia"
                  value={form.direccionExacta}
                  onChange={(e) => setForm((f) => ({ ...f, direccionExacta: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="referencia">Referencia (opcional)</Label>
                <Input
                  id="referencia"
                  className="mt-1.5"
                  value={form.referencia}
                  onChange={(e) => setForm((f) => ({ ...f, referencia: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <Checkbox
                  id="esPrincipal"
                  checked={form.esPrincipal}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, esPrincipal: Boolean(v) }))}
                />
                <Label htmlFor="esPrincipal" className="font-normal">
                  Usar como dirección principal
                </Label>
              </div>
              <div className="flex gap-3 sm:col-span-2">
                <Button type="submit">Guardar dirección</Button>
                {direcciones.length > 0 && (
                  <Button type="button" variant="outline" onClick={() => setMostrarForm(false)}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" onClick={() => setMostrarForm(true)}>
          <Plus className="size-4" /> Agregar dirección
        </Button>
      )}
    </div>
  );
}
