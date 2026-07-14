"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Compass, Cpu, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/fx/magnetic";
import { HeroScene } from "@/components/home/hero-scene";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const SELECTORES_HERO =
  "[data-hero-eyebrow], [data-hero-line], [data-hero-copy], [data-hero-cta], [data-hero-visual], [data-hero-card]";

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
          "[data-hero-card]",
          { y: 30, opacity: 0, duration: 0.6, stagger: 0.15 },
          "-=0.6",
        );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-[92vh] items-center overflow-hidden bg-black text-white"
    >
      <div data-hero-visual className="absolute inset-0">
        <HeroScene />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col justify-center px-6 py-16 lg:px-12">
        <div className="max-w-xl lg:max-w-2xl">
          <div
            data-hero-eyebrow
            className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary md:text-xs"
          >
            <Compass className="size-4" />
            Descubre tu próximo equipo
          </div>

          <h1 className="font-display mt-6 text-[40px] font-semibold leading-[0.95] tracking-tight md:text-[56px] lg:text-[72px]">
            <span className="block overflow-hidden">
              <span data-hero-line className="block">
                Potencia.
              </span>
            </span>
            <span className="block overflow-hidden">
              <span data-hero-line className="block">
                Rendimiento.
              </span>
            </span>
            <span className="block overflow-hidden">
              <span data-hero-line className="block">
                Sin <span className="text-primary">límites.</span>
              </span>
            </span>
          </h1>

          <p data-hero-copy className="mt-6 max-w-[500px] text-base leading-relaxed text-white/70 md:text-lg">
            Laptops, celulares, PCs gamer y accesorios — la tecnología que necesitas, con
            envío a todo el Perú.
          </p>

          <div data-hero-cta className="mt-8 flex flex-wrap items-center gap-6">
            <Magnetic>
              <Button
                size="lg"
                asChild
                className="group relative h-12 overflow-hidden rounded-xl bg-gradient-to-r from-primary to-[#0058d8] px-7 text-base shadow-none transition-shadow hover:shadow-[0_0_20px_rgba(57,135,229,0.4)]"
              >
                <Link href="/productos">
                  <span className="absolute inset-0 -translate-y-full bg-white/15 transition-transform duration-500 group-hover:translate-y-0" />
                  <span className="relative flex items-center">
                    Ver catálogo
                    <ArrowRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Button>
            </Magnetic>

            <Link
              href="#destacados"
              className="group relative text-sm font-medium uppercase tracking-wide text-white/70 transition-colors hover:text-white"
            >
              Ver ofertas destacadas
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-white transition-all duration-300 group-hover:w-full" />
            </Link>
          </div>
        </div>
      </div>

      <div
        data-hero-card
        className="absolute right-[10%] top-[22%] z-10 hidden items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-md lg:flex"
      >
        <Smartphone className="size-8 text-primary" strokeWidth={1.5} />
        <div>
          <p className="text-xs text-white/60">Gama alta</p>
          <p className="text-sm font-semibold">Galaxy S24 Ultra</p>
        </div>
      </div>

      <div
        data-hero-card
        className="absolute bottom-[16%] right-[16%] z-10 hidden items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-md lg:flex"
      >
        <Cpu className="size-8 text-primary" strokeWidth={1.5} />
        <div>
          <p className="text-xs text-white/60">PC Gamer</p>
          <p className="text-sm font-semibold">RTX 4060 · Ryzen 5</p>
        </div>
      </div>
    </section>
  );
}
