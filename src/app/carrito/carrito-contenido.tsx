"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductoMedia } from "@/components/catalogo/producto-media";
import { Magnetic } from "@/components/fx/magnetic";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";
import { TextScramble } from "@/components/fx/text-scramble";
import { useCart } from "@/lib/cart/cart-context";
import { formatoPEN, desglosarIGV } from "@/lib/format";
import { ELASTIC_EASE, STAGGER_MAX } from "@/lib/motion";
import { siteConfig } from "@/lib/site-config";

export function CarritoContenido() {
  const { items, subtotal, actualizarCantidad, quitarItem } = useCart();

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        titulo="Tu carrito está vacío"
        descripcion="Explora el catálogo y encuentra tu próximo equipo."
        cta={{ href: "/productos", label: "Ver catálogo" }}
      />
    );
  }

  const { igv } = desglosarIGV(subtotal);

  return (
    <div className="grid gap-10 lg:grid-cols-3">
      <RevealOnScroll
        className="space-y-4 lg:col-span-2"
        selector="[data-carrito-item]"
        stagger={STAGGER_MAX}
        ease={ELASTIC_EASE}
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
                  <span className="font-mono font-semibold">
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
                <span className="font-mono">{formatoPEN(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>IGV (18%, incluido)</span>
                <span className="font-mono">{formatoPEN(igv)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Envío</span>
                <span className={siteConfig.envioGratis ? "font-medium text-emerald-600" : ""}>
                  {siteConfig.envioGratis ? "Gratis" : "Se calcula en el checkout"}
                </span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-bold">
              <span>{siteConfig.envioGratis ? "Total" : "Total estimado"}</span>
              <TextScramble value={formatoPEN(subtotal)} />
            </div>
            <p className="text-xs text-muted-foreground">
              {siteConfig.envioGratis
                ? "Precio final — sin cargos ocultos ni costo de envío."
                : "Precio final — sin cargos ocultos. Solo falta sumar el envío."}
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
