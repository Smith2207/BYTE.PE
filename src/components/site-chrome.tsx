"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

// Páginas de auth "enfocadas" — sin el navbar/footer de la tienda pública
// (categorías, carrito, etc.), para que no se sientan como una pantalla
// más del catálogo sino como su propio flujo.
const RUTAS_SIN_CHROME = ["/login", "/registro"];

// Transición de página con framer-motion — complementa a GSAP/Lenis (que
// animan *dentro* de cada página) cubriendo lo que ellos no hacen: el
// cambio *entre* páginas, que si no se anima se siente como un salto seco.
function TransicionPagina({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Arranca en `false` (igual que el render del servidor) y recién se
  // ajusta tras montar — evita mismatch de hidratación por leer
  // matchMedia durante el render.
  const [reducida, setReducida] = React.useState(false);
  React.useEffect(() => {
    setReducida(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={reducida ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reducida ? undefined : { opacity: 0, y: -10 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const sinChrome = RUTAS_SIN_CHROME.includes(pathname);

  if (sinChrome) {
    return (
      <main className="flex-1">
        <TransicionPagina>{children}</TransicionPagina>
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <TransicionPagina>{children}</TransicionPagina>
      </main>
      <Footer />
    </>
  );
}
