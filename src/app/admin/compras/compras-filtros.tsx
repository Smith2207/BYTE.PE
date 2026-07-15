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
import type { CompraAlmacenada } from "@/lib/compras/store";

const TODOS = "__todos__";

export const ESTADO_COMPRA_ETIQUETA: Record<CompraAlmacenada["estado"], string> = {
  pedido: "Pedido",
  en_almacen_usa: "En almacén USA",
  en_transito: "En tránsito",
  aduana: "Aduana",
  recibido: "Recibido",
  cancelado: "Cancelado",
};

export const TIPO_ENVIO_ETIQUETA: Record<CompraAlmacenada["tipoEnvio"], string> = {
  directo_peru: "Directo a Perú",
  almacen_usa: "Vía almacén USA",
};

export function ComprasFiltros() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = React.useState(searchParams.get("q") ?? "");

  function actualizar(cambios: { q?: string; estado?: string }) {
    const next = new URLSearchParams();
    const nuevoQ = (cambios.q ?? searchParams.get("q") ?? "").trim();
    const nuevoEstado = cambios.estado ?? searchParams.get("estado") ?? "";
    if (nuevoQ) next.set("q", nuevoQ);
    if (nuevoEstado && nuevoEstado !== TODOS) next.set("estado", nuevoEstado);
    const qs = next.toString();
    router.push(qs ? `/admin/compras?${qs}` : "/admin/compras");
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
          placeholder="Buscar por proveedor o N° de orden..."
          className="h-9 pl-9"
        />
      </div>
      <Select
        value={searchParams.get("estado") ?? TODOS}
        onValueChange={(v) => actualizar({ estado: v })}
      >
        <SelectTrigger className="h-9 w-44">
          <SelectValue placeholder="Todos los estados" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODOS}>Todos los estados</SelectItem>
          {(Object.keys(ESTADO_COMPRA_ETIQUETA) as CompraAlmacenada["estado"][]).map((estado) => (
            <SelectItem key={estado} value={estado}>
              {ESTADO_COMPRA_ETIQUETA[estado]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </form>
  );
}
