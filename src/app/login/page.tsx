import { Suspense } from "react";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";
import { LoginForm } from "./login-form";

export const metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <RevealOnScroll y={24}>
        <h1 className="font-display mb-6 text-center text-2xl font-bold">Iniciar sesión</h1>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </RevealOnScroll>
    </div>
  );
}
