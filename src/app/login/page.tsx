import { Suspense } from "react";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";
import { ScrollCinematicBackdrop } from "@/components/fx/scroll-cinematic-backdrop";
import { LoginForm } from "./login-form";

export const metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <div className="relative mx-auto max-w-sm px-4 py-16 sm:px-6">
      <ScrollCinematicBackdrop />
      <RevealOnScroll y={24} className="relative z-10">
        <h1 className="font-display mb-6 text-center text-2xl font-bold">Iniciar sesión</h1>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </RevealOnScroll>
    </div>
  );
}
