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
import type { CategoriaAlmacenada } from "@/lib/mock/repo";
import { crearCategoriaAction, actualizarCategoriaAction } from "./actions";

const SIN_PADRE = "__ninguna__";

export function CategoriaDialog({
  categoriasPadre,
  categoria,
}: {
  categoriasPadre: CategoriaAlmacenada[];
  categoria?: CategoriaAlmacenada;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [nombre, setNombre] = React.useState(categoria?.nombre ?? "");
  const [padreId, setPadreId] = React.useState(categoria?.categoriaPadreId ?? SIN_PADRE);
  const [guardando, setGuardando] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    try {
      const categoriaPadreId = padreId === SIN_PADRE ? null : padreId;
      if (categoria) {
        await actualizarCategoriaAction(categoria.id, { nombre, categoriaPadreId });
        toast.success("Categoría actualizada");
      } else {
        await crearCategoriaAction({ nombre, categoriaPadreId });
        toast.success("Categoría creada");
      }
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("No se pudo guardar la categoría");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {categoria ? (
          <Button variant="ghost" size="icon" aria-label="Editar categoría">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" /> Nueva categoría
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{categoria ? "Editar categoría" : "Nueva categoría"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cat-nombre">Nombre</Label>
            <Input
              id="cat-nombre"
              className="mt-1.5"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="cat-padre">Categoría padre (opcional)</Label>
            <Select value={padreId} onValueChange={setPadreId}>
              <SelectTrigger id="cat-padre" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SIN_PADRE}>Ninguna (categoría principal)</SelectItem>
                {categoriasPadre
                  .filter((c) => c.id !== categoria?.id)
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nombre}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
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
