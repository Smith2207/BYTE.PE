import type { Metadata } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { SessionProvider } from "@/components/session-provider";
import { CartProvider } from "@/lib/cart/cart-context";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsappButton } from "@/components/layout/whatsapp-button";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/lib/site-config";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// Fuente de impacto para titulares "cinematográficos" (hero) — separada de
// --font-display (Inter, usada en el resto del sitio) para no convertir
// cada <h1> del admin/checkout/etc. en texto condensado mayúscula.
const bebasNeue = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas" });

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.nombre} — Electrónica y tecnología en Perú`,
    template: `%s | ${siteConfig.nombre}`,
  },
  description: siteConfig.descripcion,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${bebasNeue.variable}`} suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <SessionProvider>
            <CartProvider>
              <SmoothScrollProvider>
                <div className="relative flex min-h-screen flex-col">
                  <Navbar />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </div>
                <WhatsappButton />
                <Toaster />
              </SmoothScrollProvider>
            </CartProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
