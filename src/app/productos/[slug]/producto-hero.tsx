"use client";

import * as React from "react";
import { ShieldCheck, Truck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { WishlistBoton } from "@/components/catalogo/wishlist-boton";
import { GlowOrb, AtmosphereLayer } from "@/components/fx/cinematic-backdrop";
import { TextScramble } from "@/components/fx/text-scramble";
import { GaleriaProducto } from "./galeria-producto";
import { AgregarCarrito } from "./agregar-carrito";
import { AvisoStockForm } from "./aviso-stock-form";
import { formatoPEN } from "@/lib/format";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import type { ProductoCatalogo, VarianteCatalogo } from "@/lib/mock/repo";

const SELECTORES =
  "[data-ph-eyebrow], [data-ph-title], [data-ph-price], [data-ph-meta], [data-ph-cta], [data-ph-visual]";

export function ProductoHero({
  producto,
  variantes,
  inicialEnWishlist,
}: {
  producto: ProductoCatalogo;
  variantes: VarianteCatalogo[];
  inicialEnWishlist: boolean;
}) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const backdropRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (prefersReducedMotion()) {
      gsap.set(SELECTORES, { clearProps: "all" });
      return;
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from("[data-ph-visual]", { scale: 0.88, opacity: 0, rotate: -2, duration: 0.9 })
        .from("[data-ph-eyebrow]", { y: 16, opacity: 0, duration: 0.45 }, "-=0.5")
        .from("[data-ph-title]", { yPercent: 100, duration: 0.7 }, "-=0.3")
        .from("[data-ph-price]", { y: 16, opacity: 0, duration: 0.45 }, "-=0.35")
        .from("[data-ph-meta]", { y: 12, opacity: 0, duration: 0.3, stagger: 0.035 }, "-=0.25")
        .from("[data-ph-cta]", { y: 16, opacity: 0, duration: 0.4 }, "-=0.5");
    }, rootRef);

    return () => ctx.revert();
  }, []);

  React.useEffect(() => {
    if (prefersReducedMotion()) return;
    const root = rootRef.current;
    const backdrop = backdropRef.current;
    if (!root || !backdrop) return;

    const quickX = gsap.quickTo(backdrop, "x", { duration: 0.6, ease: "power3.out" });
    const quickY = gsap.quickTo(backdrop, "y", { duration: 0.6, ease: "power3.out" });

    function onMove(e: MouseEvent) {
      const rect = root!.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      quickX(relX * 24);
      quickY(relY * 24);
    }

    root.addEventListener("mousemove", onMove);
    return () => root.removeEventListener("mousemove", onMove);
  }, []);

  const especificacionesDestacadas = Object.entries(producto.specsJson).slice(0, 4);

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black px-6 py-12 text-white sm:px-10 lg:px-14 lg:py-16"
    >
      <div ref={backdropRef} className="absolute inset-0 scale-110">
        <GlowOrb />
      </div>
      <AtmosphereLayer glowPosition="50% 30%" showRays intensity={0.7} />

      <div className="relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center">
        <div data-ph-visual>
          <GaleriaProducto
            categoriaSlug={producto.categoria.slug}
            imagenes={producto.imagenes}
            nombre={producto.nombre}
            videoUrl={producto.videoEstado === "listo" ? producto.videoUrl : null}
          />
        </div>

        <div>
          <div data-ph-eyebrow className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {producto.marca}
            </span>
            <WishlistBoton
              productoId={producto.id}
              inicialEnWishlist={inicialEnWishlist}
              className="border border-white/10"
            />
          </div>

          <h1 className="font-display mt-3 text-3xl font-semibold leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
            <span className="block overflow-hidden">
              <span data-ph-title className="block">
                {producto.nombre}
              </span>
            </span>
          </h1>

          <div data-ph-price className="mt-6 flex items-center gap-3">
            <TextScramble value={formatoPEN(producto.precioFinal)} className="text-3xl font-bold" />
            {producto.precioOferta && (
              <span className="font-mono text-base text-white/40 line-through">
                {formatoPEN(producto.precio)}
              </span>
            )}
            {producto.descuentoPorcentaje > 0 && (
              <Badge className="bg-accent text-accent-foreground">
                -{producto.descuentoPorcentaje}%
              </Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-white/40">Precio incluye IGV (18%)</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {especificacionesDestacadas.map(([clave, valor]) => (
              <span
                key={clave}
                data-ph-meta
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70"
              >
                <span className="text-white/40">{clave}:</span>{" "}
                <span className="font-mono">{valor}</span>
              </span>
            ))}
          </div>

          <p className="mt-6 max-w-md text-sm leading-relaxed text-white/60">
            {producto.descripcion}
          </p>

          <div className="mt-5 flex flex-wrap gap-4 text-xs text-white/50">
            <span data-ph-meta className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-primary" />
              {producto.garantiaMeses} meses de garantía
            </span>
            <span data-ph-meta className="flex items-center gap-1.5">
              <Truck className="size-4 text-primary" />
              Envío calculado en el checkout
            </span>
            <span data-ph-meta className="flex items-center gap-1.5">
              SKU: <span className="font-mono">{producto.sku}</span>
            </span>
          </div>

          <div data-ph-cta className="mt-8">
            {producto.disponible ? (
              <AgregarCarrito producto={producto} variantes={variantes} />
            ) : (
              <div className="space-y-3">
                <Badge variant="secondary">Producto agotado</Badge>
                <AvisoStockForm productoId={producto.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
