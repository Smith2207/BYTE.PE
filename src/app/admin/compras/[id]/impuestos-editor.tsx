"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { formatoPEN } from "@/lib/format";
import { actualizarImpuestosCompraAction } from "../actions";

export function ImpuestosEditor({
  compraId,
  pagoImpuestos,
  montoImpuestos,
}: {
  compraId: string;
  pagoImpuestos: boolean;
  montoImpuestos?: number;
}) {
  const router = useRouter();
  const [editando, setEditando] = React.useState(false);
  const [guardando, setGuardando] = React.useState(false);
  const [checked, setChecked] = React.useState(pagoImpuestos);
  const [monto, setMonto] = React.useState(montoImpuestos?.toString() ?? "0");

  async function guardar() {
    setGuardando(true);
    try {
      await actualizarImpuestosCompraAction(compraId, {
        pagoImpuestos: checked,
        montoImpuestos: checked ? Number(monto) || 0 : undefined,
      });
      toast.success("Impuestos actualizados");
      setEditando(false);
      router.refresh();
    } catch {
      toast.error("No se pudo actualizar");
    } finally {
      setGuardando(false);
    }
  }

  if (!editando) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">Impuestos de aduana</p>
          <p>
            {pagoImpuestos ? formatoPEN(montoImpuestos ?? 0) : "No pagó impuestos"}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setEditando(true)} aria-label="Editar impuestos">
          <Pencil className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-border/60 p-3">
      <div className="flex items-center gap-2">
        <Checkbox
          id="editar-pago-impuestos"
          checked={checked}
          onCheckedChange={(v) => setChecked(Boolean(v))}
        />
        <Label htmlFor="editar-pago-impuestos" className="font-normal">
          Pagó impuestos de aduana
        </Label>
      </div>
      {checked && (
        <div>
          <Label htmlFor="editar-monto-impuestos">Monto (S/)</Label>
          <Input
            id="editar-monto-impuestos"
            type="number"
            step="0.01"
            min="0"
            className="mt-1.5"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
          />
        </div>
      )}
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setEditando(false)}>
          Cancelar
        </Button>
        <Button type="button" size="sm" onClick={guardar} disabled={guardando}>
          {guardando ? <Loader2 className="size-4 animate-spin" /> : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
