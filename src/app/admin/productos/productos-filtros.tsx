"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CategoriaAlmacenada } from "@/lib/mock/repo";

const TODOS = "__todos__";

export function ProductosFiltros({ categorias }: { categorias: CategoriaAlmacenada[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = React.useState(searchParams.get("q") ?? "");

  function actualizar(cambios: { q?: string; categoria?: string; estado?: string }) {
    const next = new URLSearchParams();
    const nuevoQ = (cambios.q ?? searchParams.get("q") ?? "").trim();
    const nuevaCategoria = cambios.categoria ?? searchParams.get("categoria") ?? "";
    const nuevoEstado = cambios.estado ?? searchParams.get("estado") ?? "";
    if (nuevoQ) next.set("q", nuevoQ);
    if (nuevaCategoria && nuevaCategoria !== TODOS) next.set("categoria", nuevaCategoria);
    if (nuevoEstado && nuevoEstado !== TODOS) next.set("estado", nuevoEstado);
    const qs = next.toString();
    router.push(qs ? `/admin/productos?${qs}` : "/admin/productos");
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    actualizar({ q });
  }

  return (
    <form onSubmit={onSubmit} className="mb-4 flex flex-wrap items-center gap-3">
      <div className="relative max-w-xs flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre o SKU..."
          className="h-9 pl-9"
        />
      </div>
      <Select
        value={searchParams.get("categoria") ?? TODOS}
        onValueChange={(v) => actualizar({ categoria: v })}
      >
        <SelectTrigger className="h-9 w-48">
          <SelectValue placeholder="Todas las categorías" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODOS}>Todas las categorías</SelectItem>
          {categorias.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={searchParams.get("estado") ?? TODOS}
        onValueChange={(v) => actualizar({ estado: v })}
      >
        <SelectTrigger className="h-9 w-40">
          <SelectValue placeholder="Todos los estados" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODOS}>Todos los estados</SelectItem>
          <SelectItem value="activo">Activo</SelectItem>
          <SelectItem value="inactivo">Inactivo</SelectItem>
        </SelectContent>
      </Select>
    </form>
  );
}
