"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProductoMedia } from "@/components/catalogo/producto-media";
import { Magnetic } from "@/components/fx/magnetic";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";
import { useCart } from "@/lib/cart/cart-context";
import { formatoPEN, desglosarIGV } from "@/lib/format";

export function CarritoContenido() {
  const { items, subtotal, actualizarCantidad, quitarItem } = useCart();

  if (items.length === 0) {
    return (
      <RevealOnScroll className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-24 text-center">
        <ShoppingBag className="size-10 text-muted-foreground" />
        <p className="mt-4 text-lg font-semibold">Tu carrito está vacío</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Explora el catálogo y encuentra tu próximo equipo.
        </p>
        <Magnetic strength={0.15} className="mt-6 inline-block">
          <Button asChild>
            <Link href="/productos">Ver catálogo</Link>
          </Button>
        </Magnetic>
      </RevealOnScroll>
    );
  }

  const { igv } = desglosarIGV(subtotal);

  return (
    <div className="grid gap-10 lg:grid-cols-3">
      <RevealOnScroll
        className="space-y-4 lg:col-span-2"
        selector="[data-carrito-item]"
        stagger={0.06}
        y={16}
      >
        {items.map((item) => (
          <Card key={`${item.productoId}-${item.varianteId}`} data-carrito-item>
            <CardContent className="flex gap-4 p-4">
              <Link
                href={`/productos/${item.slug}`}
                className="size-20 shrink-0 overflow-hidden rounded-xl border border-border/60"
              >
                <ProductoMedia
                  categoriaSlug={item.categoriaSlug}
                  imagenUrl={item.imagenUrl}
                  alt={item.nombre}
                  className="size-full"
                  iconClassName="size-8"
                  sizes="80px"
                />
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      {item.marca}
                    </span>
                    <Link
                      href={`/productos/${item.slug}`}
                      className="block text-sm font-semibold hover:underline"
                    >
                      {item.nombre}
                    </Link>
                    {item.varianteLabel && (
                      <span className="text-xs text-muted-foreground">{item.varianteLabel}</span>
                    )}
                  </div>
                  <button
                    onClick={() => quitarItem(item.productoId, item.varianteId)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Quitar del carrito"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-full border border-border/60">
                    <button
                      className="flex size-8 items-center justify-center text-foreground/70 hover:text-foreground"
                      onClick={() =>
                        actualizarCantidad(item.productoId, item.varianteId, item.cantidad - 1)
                      }
                      aria-label="Disminuir cantidad"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-7 text-center text-sm font-medium">{item.cantidad}</span>
                    <button
                      className="flex size-8 items-center justify-center text-foreground/70 hover:text-foreground"
                      onClick={() =>
                        actualizarCantidad(item.productoId, item.varianteId, item.cantidad + 1)
                      }
                      aria-label="Aumentar cantidad"
                      disabled={item.cantidad >= item.stockDisponible}
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <span className="font-display font-semibold">
                    {formatoPEN(item.precioUnitario * item.cantidad)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </RevealOnScroll>

      <div>
        <Card className="sticky top-24">
          <CardContent className="space-y-3 pt-6">
            <h3 className="text-sm font-semibold">Resumen</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatoPEN(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>IGV (18%, incluido)</span>
                <span>{formatoPEN(igv)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Envío</span>
                <span>Se calcula en el checkout</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-bold">
              <span>Total estimado</span>
              <span>{formatoPEN(subtotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Precio final — sin cargos ocultos. Solo falta sumar el envío.
            </p>
            <Magnetic className="block">
              <Button size="lg" className="w-full rounded-full" asChild>
                <Link href="/checkout">Ir a pagar</Link>
              </Button>
            </Magnetic>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
