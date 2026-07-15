import type { Metadata } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { SessionProvider } from "@/components/session-provider";
import { CartProvider } from "@/lib/cart/cart-context";
import { SiteChrome } from "@/components/site-chrome";
import { WhatsappButton } from "@/components/layout/whatsapp-button";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/lib/site-config";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// Fuente de impacto para titulares "cinematográficos" (hero) — separada de
// --font-display (Inter, usada en el resto del sitio) para no convertir
// cada <h1> del admin/checkout/etc. en texto condensado mayúscula.
const bebasNeue = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas" });

const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: `${siteConfig.nombre} — Electrónica y tecnología en Perú`,
    template: `%s | ${siteConfig.nombre}`,
  },
  description: siteConfig.descripcion,
};

const organizacionJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.nombre,
  url: BASE_URL,
  logo: `${BASE_URL}/favicon.ico`,
  email: siteConfig.email,
  description: siteConfig.descripcion,
  areaServed: "PE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${bebasNeue.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen font-sans antialiased">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizacionJsonLd) }}
        />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <SessionProvider>
            <CartProvider>
              <SmoothScrollProvider>
                <div className="relative flex min-h-screen flex-col">
                  <SiteChrome>{children}</SiteChrome>
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
