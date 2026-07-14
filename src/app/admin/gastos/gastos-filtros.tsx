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
import { CATEGORIA_GASTO_ETIQUETA } from "./categoria-gasto";
import type { CategoriaGasto } from "@/db/schema/enums";

const TODOS = "__todos__";

export function GastosFiltros() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = React.useState(searchParams.get("q") ?? "");

  function actualizar(cambios: { q?: string; categoria?: string }) {
    const next = new URLSearchParams();
    const nuevoQ = (cambios.q ?? searchParams.get("q") ?? "").trim();
    const nuevaCategoria = cambios.categoria ?? searchParams.get("categoria") ?? "";
    if (nuevoQ) next.set("q", nuevoQ);
    if (nuevaCategoria && nuevaCategoria !== TODOS) next.set("categoria", nuevaCategoria);
    const qs = next.toString();
    router.push(qs ? `/admin/gastos?${qs}` : "/admin/gastos");
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
          placeholder="Buscar por descripción..."
          className="h-9 pl-9"
        />
      </div>
      <Select
        value={searchParams.get("categoria") ?? TODOS}
        onValueChange={(v) => actualizar({ categoria: v })}
      >
        <SelectTrigger className="h-9 w-44">
          <SelectValue placeholder="Todas las categorías" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODOS}>Todas las categorías</SelectItem>
          {(Object.keys(CATEGORIA_GASTO_ETIQUETA) as CategoriaGasto[]).map((categoria) => (
            <SelectItem key={categoria} value={categoria}>
              {CATEGORIA_GASTO_ETIQUETA[categoria]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </form>
  );
}
