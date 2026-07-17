"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, Search, Heart, ShoppingBag, User, LogOut, Package, Shield } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { categoriasNav, siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart/cart-context";
import { ModeToggle } from "@/components/mode-toggle";
import { FloatingIndicator } from "@/components/fx/floating-indicator";

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [hoverSlug, setHoverSlug] = React.useState<string | null>(null);
  const navRef = React.useRef<HTMLElement>(null);
  const { cantidadTotal } = useCart();
  const { data: session, status } = useSession();
  const pathname = usePathname();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sobre el hero cinematográfico del home (video a pantalla completa) el
  // navbar se vuelve transparente y usa mix-blend-difference: el navegador
  // invierte el color por píxel contra lo que hay detrás, así que el
  // contraste queda resuelto solo, sin recolorear cada link a mano. Se
  // desactiva apenas hay scroll o en cualquier otra página (ahí sí necesita
  // su fondo sólido normal para no perderse sobre contenido claro).
  const sobreHeroCinematografico = pathname === "/" && !scrolled;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-colors print:hidden",
        sobreHeroCinematografico
          ? "border-b border-transparent bg-transparent mix-blend-difference"
          : scrolled
            ? "border-b border-border/60 bg-background-95 backdrop-blur-md"
            : "border-b border-white/[0.06] bg-background-40 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menú">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle className="font-display text-xl font-semibold">
                {siteConfig.nombre}
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-1">
              {categoriasNav.map((c) => (
                <Link
                  key={c.slug}
                  href={`/productos?categoria=${c.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition hover:bg-secondary hover:text-foreground"
                >
                  {c.nombre}
                </Link>
              ))}
              <Link
                href="/productos"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-primary"
              >
                Ver todo el catálogo
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="mr-2 shrink-0">
          <span className="font-display text-xl font-semibold tracking-tight">
            {siteConfig.nombre}
          </span>
        </Link>

        <nav
          ref={navRef}
          onMouseLeave={() => setHoverSlug(null)}
          className="relative hidden items-center gap-1 lg:flex"
        >
          <FloatingIndicator containerRef={navRef} activeKey={hoverSlug ?? ""} />
          {categoriasNav.map((c) => (
            <Link
              key={c.slug}
              href={`/productos?categoria=${c.slug}`}
              data-indicator-item
              data-active={hoverSlug === c.slug}
              onMouseEnter={() => setHoverSlug(c.slug)}
              className="relative rounded-full px-3.5 py-2 text-sm font-medium text-foreground/75 transition hover:text-foreground"
            >
              {c.nombre}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <div className="relative hidden sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              className="h-9 w-40 rounded-full bg-secondary/60 pl-9 md:w-56"
            />
          </div>
          <Button variant="ghost" size="icon" className="sm:hidden" aria-label="Buscar">
            <Search className="size-5" />
          </Button>
          <ModeToggle />
          <Button variant="ghost" size="icon" asChild aria-label="Lista de deseos">
            <Link href="/cuenta/wishlist">
              <Heart className="size-5" />
            </Link>
          </Button>
          {status === "authenticated" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Mi cuenta">
                  <User className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="truncate">
                  {session.user?.name ?? session.user?.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/cuenta">
                    <User className="size-4" /> Mi cuenta
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/cuenta/pedidos">
                    <Package className="size-4" /> Mis pedidos
                  </Link>
                </DropdownMenuItem>
                {session.user?.rol === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <Shield className="size-4" /> Panel admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                  <LogOut className="size-4" /> Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" asChild aria-label="Iniciar sesión">
              <Link href="/login">
                <User className="size-5" />
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" asChild className="relative" aria-label="Carrito">
            <Link href="/carrito">
              <ShoppingBag className="size-5" />
              <AnimatePresence>
                {cantidadTotal > 0 && (
                  <motion.div
                    key={cantidadTotal}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="absolute -right-1 -top-1"
                  >
                    <Badge className="h-[18px] min-w-[18px] justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                      {cantidadTotal}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
