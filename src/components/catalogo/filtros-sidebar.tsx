"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { CategoriaConHijas } from "@/lib/mock/repo";
import { cn } from "@/lib/utils";

export function FiltrosSidebar({
  categorias,
  marcas,
}: {
  categorias: CategoriaConHijas[];
  marcas: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoriaActiva = searchParams.get("categoria");
  const marcasActivas = searchParams.get("marca")?.split(",").filter(Boolean) ?? [];
  const [precioMin, setPrecioMin] = React.useState(searchParams.get("precioMin") ?? "");
  const [precioMax, setPrecioMax] = React.useState(searchParams.get("precioMax") ?? "");

  function actualizarParams(mutar: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutar(params);
    params.delete("page");
    router.push(`/productos?${params.toString()}`);
  }

  function toggleMarca(marca: string) {
    actualizarParams((params) => {
      const actuales = new Set(marcasActivas);
      if (actuales.has(marca)) actuales.delete(marca);
      else actuales.add(marca);
      if (actuales.size > 0) params.set("marca", Array.from(actuales).join(","));
      else params.delete("marca");
    });
  }

  function aplicarPrecio() {
    actualizarParams((params) => {
      if (precioMin) params.set("precioMin", precioMin);
      else params.delete("precioMin");
      if (precioMax) params.set("precioMax", precioMax);
      else params.delete("precioMax");
    });
  }

  const hayFiltros = categoriaActiva || marcasActivas.length > 0 || precioMin || precioMax;

  return (
    <aside className="w-full shrink-0 space-y-6 lg:w-64">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Filtros</h2>
        {hayFiltros && (
          <Link
            href="/productos"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="size-3" /> Limpiar
          </Link>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Categoría
        </h3>
        <div className="space-y-1">
          {categorias.map((c) => (
            <div key={c.slug}>
              <Link
                href={`/productos?categoria=${c.slug}`}
                className={cn(
                  "block rounded-md px-2 py-1.5 text-sm transition hover:bg-secondary",
                  categoriaActiva === c.slug
                    ? "bg-secondary font-medium text-primary"
                    : "text-foreground/80",
                )}
              >
                {c.nombre}
              </Link>
              {c.subcategorias.length > 0 && (
                <div className="ml-3 space-y-1 border-l border-border/60 pl-3">
                  {c.subcategorias.map((sub) => (
                    <Link
                      key={sub.slug}
                      href={`/productos?categoria=${sub.slug}`}
                      className={cn(
                        "block rounded-md px-2 py-1 text-sm transition hover:bg-secondary",
                        categoriaActiva === sub.slug
                          ? "bg-secondary font-medium text-primary"
                          : "text-muted-foreground",
                      )}
                    >
                      {sub.nombre}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Marca
        </h3>
        <div className="space-y-2">
          {marcas.map((marca) => (
            <div key={marca} className="flex items-center gap-2">
              <Checkbox
                id={`marca-${marca}`}
                checked={marcasActivas.includes(marca)}
                onCheckedChange={() => toggleMarca(marca)}
              />
              <Label htmlFor={`marca-${marca}`} className="text-sm font-normal">
                {marca}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Precio (S/)
        </h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Mín"
            value={precioMin}
            onChange={(e) => setPrecioMin(e.target.value)}
            className="h-9"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            placeholder="Máx"
            value={precioMax}
            onChange={(e) => setPrecioMax(e.target.value)}
            className="h-9"
          />
        </div>
        <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={aplicarPrecio}>
          Aplicar
        </Button>
      </div>
    </aside>
  );
}
