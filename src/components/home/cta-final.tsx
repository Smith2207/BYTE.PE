import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GlowOrb, AtmosphereLayer } from "@/components/fx/cinematic-backdrop";

export function CtaFinal() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-background px-8 py-16 text-center text-white sm:px-16">
        <div className="absolute inset-0 scale-110">
          <GlowOrb />
        </div>
        <AtmosphereLayer glowPosition="50% 40%" showRays={false} intensity={0.8} />
        <div className="relative z-10">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Tu próximo equipo te espera
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-white/70 sm:text-base">
            Laptops, celulares, PCs gamer y accesorios — con envío a todo el Perú y precios sin sorpresas.
          </p>
          <Link
            href="/productos"
            className="group mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-[#0058d8] px-7 text-base font-semibold text-white transition-shadow hover:shadow-[0_0_20px_rgba(57,135,229,0.4)]"
          >
            Ver catálogo completo
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
