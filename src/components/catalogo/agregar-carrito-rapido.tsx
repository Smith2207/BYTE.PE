"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

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
    <motion.button
      type="button"
      onClick={onClick}
      aria-label="Agregar al carrito"
      whileTap={{ scale: 0.85 }}
      animate={agregado ? { scale: [1, 1.15, 1] } : { scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {agregado ? (
          <motion.span
            key="check"
            initial={{ scale: 0.4, rotate: -90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.25, ease: "backOut" }}
            className="flex"
          >
            <Check className="size-4" />
          </motion.span>
        ) : (
          <motion.span
            key="bag"
            initial={{ scale: 0.4, rotate: 90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.25, ease: "backOut" }}
            className="flex"
          >
            <ShoppingBag className="size-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
