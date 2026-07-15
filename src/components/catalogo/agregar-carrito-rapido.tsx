"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, ShoppingBag } from "lucide-react";

import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart/cart-context";
import type { ProductoCatalogo } from "@/lib/mock/repo";

/** Botón de agregado rápido para las cards de listado (home, /productos,
 * wishlist) — solo tiene sentido cuando el producto NO tiene variantes
 * (talla, color...), porque ahí sí hace falta elegir una en el detalle
 * antes de poder agregarlo. Vive dentro de un <Link> (ProductoLink), así
 * que frena la navegación con preventDefault/stopPropagation, mismo
 * patrón que WishlistBoton. */
export function AgregarCarritoRapido({
  producto,
  className,
}: {
  producto: ProductoCatalogo;
  className?: string;
}) {
  const { agregarItem } = useCart();
  const [agregado, setAgregado] = React.useState(false);

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!producto.disponible || producto.stock <= 0) return;

    agregarItem(
      {
        productoId: producto.id,
        varianteId: null,
        slug: producto.slug,
        nombre: producto.nombre,
        marca: producto.marca,
        categoriaSlug: producto.categoria.slug,
        imagenUrl: producto.imagenes[0] ?? null,
        precioUnitario: producto.precioFinal,
        stockDisponible: producto.stock,
      },
      1,
    );
    toast.success("Producto agregado al carrito", { description: producto.nombre });
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Agregar al carrito"
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90 active:scale-95",
        className,
      )}
    >
      {agregado ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
    </button>
  );
}
