"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

// Páginas de auth "enfocadas" — sin el navbar/footer de la tienda pública
// (categorías, carrito, etc.), para que no se sientan como una pantalla
// más del catálogo sino como su propio flujo.
const RUTAS_SIN_CHROME = ["/login", "/registro"];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const sinChrome = RUTAS_SIN_CHROME.includes(pathname);

  if (sinChrome) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
