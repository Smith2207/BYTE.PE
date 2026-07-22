"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/fx/magnetic";
import { HeroScene } from "@/components/home/hero-scene";
import { categoriasNav } from "@/lib/site-config";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const SELECTORES_HERO =
  "[data-hero-eyebrow], [data-hero-line], [data-hero-copy], [data-hero-cta], [data-hero-visual], [data-hero-side], [data-hero-scroll]";

export function Hero() {
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (prefersReducedMotion()) {
      gsap.set(SELECTORES_HERO, { clearProps: "all" });
      return;
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from("[data-hero-eyebrow]", { y: 20, opacity: 0, duration: 0.6 })
        .from(
          "[data-hero-line]",
          { yPercent: 100, duration: 0.8, stagger: 0.1 },
          "-=0.35",
        )
        .from("[data-hero-copy]", { y: 20, opacity: 0, duration: 0.6 }, "-=0.5")
        .from("[data-hero-cta]", { y: 20, opacity: 0, duration: 0.6, stagger: 0.1 }, "-=0.45")
        .from(
          "[data-hero-visual]",
          { scale: 0.92, opacity: 0, duration: 1, ease: "power2.out" },
          "-=0.9",
        )
        .from(
          "[data-hero-side]",
          { x: 20, opacity: 0, duration: 0.6, stagger: 0.08 },
          "-=0.6",
        )
        .from("[data-hero-scroll]", { opacity: 0, duration: 0.6 }, "-=0.3");
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative flex h-screen min-h-[640px] w-full items-center overflow-hidden bg-background text-white"
    >
      <div data-hero-visual className="absolute inset-0">
        <HeroScene />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-1 items-center justify-between px-6 md:px-16">
        <div className="max-w-xl lg:max-w-2xl">
          <div
            data-hero-eyebrow
            className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary md:text-xs"
          >
            <Compass className="size-4" />
            Descubre tu próximo equipo
          </div>

          <h1 className="font-heading mt-6 flex flex-col text-6xl uppercase leading-[0.9] tracking-wide drop-shadow-xl sm:text-7xl lg:text-8xl xl:text-9xl">
            <span className="block overflow-hidden">
              <span data-hero-line className="block">
                Potencia
              </span>
            </span>
            <span className="block overflow-hidden">
              <span data-hero-line className="block text-primary">
                Rendimiento
              </span>
            </span>
            <span className="block overflow-hidden">
              <span data-hero-line className="block">
                Sin límites
              </span>
            </span>
          </h1>

          <p
            data-hero-copy
            className="mt-6 max-w-sm text-sm font-normal leading-relaxed text-white/70 drop-shadow-md md:text-base"
          >
            Laptops, celulares, PCs gamer y accesorios — la tecnología que necesitas, con
            envío a todo el Perú.
          </p>

          <div data-hero-cta className="mt-8 flex flex-col flex-wrap gap-4 sm:flex-row">
            <Magnetic>
              <Button
                asChild
                className="group relative h-auto overflow-hidden rounded-lg px-7 py-3 text-[11px] font-bold tracking-[0.1em] shadow-none transition-shadow duration-300 hover:shadow-[0_0_20px_rgba(57,135,229,0.4)]"
              >
                <Link href="/productos">
                  <span className="absolute inset-0 -translate-y-full bg-white/15 transition-transform duration-500 group-hover:translate-y-0" />
                  <span className="relative flex items-center uppercase">
                    Ver catálogo
                    <ArrowRight className="ml-1.5 size-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Button>
            </Magnetic>

            <Magnetic>
              <Button
                asChild
                variant="outline"
                className="h-auto rounded-lg border-white/40 bg-transparent px-7 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition-colors duration-300 hover:border-white hover:bg-white/5 hover:text-white"
              >
                <Link href="#destacados">Ofertas destacadas</Link>
              </Button>
            </Magnetic>
          </div>
        </div>

        <div
          className="hidden flex-col gap-6 text-[10px] font-bold tracking-[0.2em] lg:flex"
          aria-label="Categorías destacadas"
        >
          {categoriasNav.map((c, i) => (
            <Link
              key={c.slug}
              href={`/productos?categoria=${c.slug}`}
              data-hero-side
              className="group flex cursor-pointer items-center gap-4"
            >
              <span
                className={`w-5 shrink-0 ${i === 0 ? "text-primary" : "text-white/40 transition-colors duration-300 group-hover:text-white"}`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={`uppercase ${i === 0 ? "text-white" : "text-white/40 transition-colors duration-300 group-hover:text-white"}`}
              >
                {c.nombre}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div
        data-hero-scroll
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.3em] text-white/60"
      >
        Scroll
        <span className="animate-scroll block h-6 w-px bg-gradient-to-b from-primary to-transparent" />
      </div>
    </section>
  );
}
