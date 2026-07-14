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
import type { CourierAlmacenado } from "@/lib/couriers/store";
import { crearCourierAction, actualizarCourierAction } from "./actions";

export function CourierDialog({ courier }: { courier?: CourierAlmacenado }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [guardando, setGuardando] = React.useState(false);
  const [nombre, setNombre] = React.useState(courier?.nombre ?? "");
  const [trackingUrlPattern, setTrackingUrlPattern] = React.useState(
    courier?.trackingUrlPattern ?? "",
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    try {
      if (courier) {
        await actualizarCourierAction(courier.id, { nombre, trackingUrlPattern });
        toast.success("Courier actualizado");
      } else {
        await crearCourierAction({ nombre, trackingUrlPattern });
        toast.success("Courier creado");
      }
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("No se pudo guardar el courier");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {courier ? (
          <Button variant="ghost" size="icon" aria-label="Editar courier">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" /> Nuevo courier
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{courier ? "Editar courier" : "Nuevo courier"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              className="mt-1.5"
              required
              placeholder="Ej: Olva Courier"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="trackingUrlPattern">URL de tracking (opcional)</Label>
            <Input
              id="trackingUrlPattern"
              className="mt-1.5"
              placeholder="https://ejemplo.com/seguimiento?codigo={tracking}"
              value={trackingUrlPattern}
              onChange={(e) => setTrackingUrlPattern(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Usa <code>{"{tracking}"}</code> donde va el código de seguimiento del pedido.
            </p>
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
