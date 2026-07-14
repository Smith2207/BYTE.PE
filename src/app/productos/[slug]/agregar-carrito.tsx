"use client";

import * as React from "react";
import { toast } from "sonner";
import { Minus, Plus, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/fx/magnetic";
import { useCart } from "@/lib/cart/cart-context";
import { formatoPEN } from "@/lib/format";
import type { ProductoCatalogo, VarianteCatalogo } from "@/lib/mock/repo";

export function AgregarCarrito({
  producto,
  variantes,
}: {
  producto: ProductoCatalogo;
  variantes: VarianteCatalogo[];
}) {
  const { agregarItem } = useCart();
  const [cantidad, setCantidad] = React.useState(1);

  const gruposVariantes = React.useMemo(() => {
    const grupos = new Map<string, VarianteCatalogo[]>();
    for (const v of variantes) {
      const lista = grupos.get(v.atributo) ?? [];
      lista.push(v);
      grupos.set(v.atributo, lista);
    }
    return Array.from(grupos.entries());
  }, [variantes]);

  const [seleccion, setSeleccion] = React.useState<Record<string, string>>(() => {
    const inicial: Record<string, string> = {};
    for (const [atributo, lista] of gruposVariantes) {
      inicial[atributo] = lista[0].id;
    }
    return inicial;
  });

  const precioExtra = Object.values(seleccion).reduce((acc, varianteId) => {
    const v = variantes.find((x) => x.id === varianteId);
    return acc + (v?.precioExtra ?? 0);
  }, 0);

  const stockDisponible =
    variantes.length > 0
      ? (variantes.find((v) => v.id === Object.values(seleccion)[0])?.stock ?? 0)
      : producto.stock;

  const precioFinal = producto.precioFinal + precioExtra;

  function onAgregar() {
    if (!producto.disponible || stockDisponible <= 0) return;

    const varianteLabel = Object.entries(seleccion)
      .map(([, varianteId]) => variantes.find((v) => v.id === varianteId)?.valor)
      .filter(Boolean)
      .join(" · ");

    agregarItem(
      {
        productoId: producto.id,
        varianteId: variantes.length > 0 ? (Object.values(seleccion)[0] ?? null) : null,
        slug: producto.slug,
        nombre: producto.nombre,
        marca: producto.marca,
        categoriaSlug: producto.categoria.slug,
        imagenUrl: producto.imagenes[0] ?? null,
        precioUnitario: precioFinal,
        stockDisponible,
        varianteLabel: varianteLabel || undefined,
      },
      cantidad,
    );

    toast.success("Producto agregado al carrito", {
      description: `${producto.nombre}${varianteLabel ? ` · ${varianteLabel}` : ""}`,
    });
  }

  return (
    <div className="space-y-6">
      {gruposVariantes.map(([atributo, lista]) => (
        <div key={atributo}>
          <p className="mb-2 text-sm font-medium capitalize">{atributo}</p>
          <div className="flex flex-wrap gap-2">
            {lista.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSeleccion((s) => ({ ...s, [atributo]: v.id }))}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${
                  seleccion[atributo] === v.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/60 text-foreground/80 hover:border-primary/40"
                }`}
              >
                {v.valor}
                {v.precioExtra > 0 && ` (+${formatoPEN(v.precioExtra)})`}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div>
        <p className="mb-2 text-sm font-medium">Cantidad</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-full border border-border/60">
            <button
              type="button"
              onClick={() => setCantidad((c) => Math.max(1, c - 1))}
              className="flex size-9 items-center justify-center text-foreground/70 hover:text-foreground"
              aria-label="Disminuir cantidad"
            >
              <Minus className="size-4" />
            </button>
            <span className="w-8 text-center text-sm font-medium">{cantidad}</span>
            <button
              type="button"
              onClick={() => setCantidad((c) => Math.min(stockDisponible, c + 1))}
              className="flex size-9 items-center justify-center text-foreground/70 hover:text-foreground"
              aria-label="Aumentar cantidad"
            >
              <Plus className="size-4" />
            </button>
          </div>
          <span className="text-xs text-muted-foreground">
            {stockDisponible > 0 ? `${stockDisponible} disponibles` : "Sin stock"}
          </span>
        </div>
      </div>

      <Magnetic className="inline-block w-full sm:w-auto">
        <Button
          size="lg"
          className="group relative h-14 w-full gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-primary to-[#0058d8] px-9 text-base font-semibold shadow-none transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_28px_rgba(57,135,229,0.45)] sm:w-auto"
          disabled={!producto.disponible || stockDisponible <= 0}
          onClick={onAgregar}
        >
          <span className="absolute inset-0 -translate-y-full bg-white/15 transition-transform duration-500 group-hover:translate-y-0" />
          <span className="relative flex items-center gap-2">
            <ShoppingBag className="size-5" />
            {producto.disponible ? "Agregar al carrito" : "Producto agotado"}
          </span>
        </Button>
      </Magnetic>
    </div>
  );
}
