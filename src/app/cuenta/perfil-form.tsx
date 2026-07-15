"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Magnetic } from "@/components/fx/magnetic";
import { actualizarPerfilAction } from "./actions";

export function PerfilForm({
  nombre,
  telefono,
  dni,
}: {
  nombre: string;
  telefono: string | null;
  dni: string | null;
}) {
  const router = useRouter();
  const [editando, setEditando] = React.useState(false);
  const [guardando, setGuardando] = React.useState(false);
  const [form, setForm] = React.useState({
    nombre,
    telefono: telefono ?? "",
    dni: dni ?? "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    try {
      await actualizarPerfilAction(form);
      toast.success("Perfil actualizado");
      setEditando(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo actualizar el perfil");
    } finally {
      setGuardando(false);
    }
  }

  if (!editando) {
    return (
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Nombre</span>
          <span className="font-medium">{nombre}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Teléfono</span>
          <span className="font-medium">{telefono || "No registrado"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">DNI</span>
          <span className="font-medium">{dni || "No registrado"}</span>
        </div>
        <Magnetic strength={0.15} className="inline-block pt-2">
          <Button variant="outline" size="sm" onClick={() => setEditando(true)}>
            <Pencil className="size-3.5" /> Editar datos
          </Button>
        </Magnetic>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label htmlFor="nombre">Nombre</Label>
        <Input
          id="nombre"
          className="mt-1.5"
          value={form.nombre}
          onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
          required
        />
      </div>
      <div>
        <Label htmlFor="telefono">Teléfono</Label>
        <Input
          id="telefono"
          className="mt-1.5"
          placeholder="9XXXXXXXX"
          maxLength={9}
          value={form.telefono}
          onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value.replace(/\D/g, "") }))}
        />
      </div>
      <div>
        <Label htmlFor="dni">DNI</Label>
        <Input
          id="dni"
          className="mt-1.5"
          placeholder="8 dígitos"
          maxLength={8}
          value={form.dni}
          onChange={(e) => setForm((f) => ({ ...f, dni: e.target.value.replace(/\D/g, "") }))}
        />
      </div>
      <div className="flex gap-3 sm:col-span-2">
        <Magnetic strength={0.15} className="inline-block">
          <Button type="submit" disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar cambios"}
          </Button>
        </Magnetic>
        <Button
          type="button"
          variant="outline"
          disabled={guardando}
          onClick={() => {
            setForm({ nombre, telefono: telefono ?? "", dni: dni ?? "" });
            setEditando(false);
          }}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
