"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tag,
  Tags,
  Receipt,
  Truck,
  FileWarning,
  Undo2,
  Wallet,
  ClipboardList,
  Route,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, seccion: null },
  { href: "/admin/productos", label: "Productos", icon: Package, seccion: "Catálogo" },
  { href: "/admin/categorias", label: "Categorías", icon: Tags, seccion: "Catálogo" },
  { href: "/admin/couriers", label: "Couriers", icon: Route, seccion: "Catálogo" },
  { href: "/admin/pedidos", label: "Pedidos", icon: Receipt, seccion: "Ventas" },
  { href: "/admin/compras", label: "Compras", icon: Truck, seccion: "Ventas" },
  { href: "/admin/cupones", label: "Cupones", icon: Tag, seccion: "Ventas" },
  { href: "/admin/devoluciones", label: "Devoluciones", icon: Undo2, seccion: "Postventa" },
  { href: "/admin/reclamos", label: "Reclamos", icon: FileWarning, seccion: "Postventa" },
  { href: "/admin/gastos", label: "Gastos", icon: Wallet, seccion: "Finanzas" },
  { href: "/admin/kardex", label: "Kardex", icon: ClipboardList, seccion: "Finanzas" },
] as const;

function esActivo(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export function AdminSidebarNavMobile() {
  const pathname = usePathname();
  return (
    <nav className="mb-6 flex gap-1 overflow-x-auto pb-1 md:hidden">
      {ADMIN_NAV_ITEMS.map((item) => {
        const activo = esActivo(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
              activo
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border/60 text-foreground/80 hover:bg-secondary hover:text-foreground",
            )}
          >
            <item.icon className="size-3.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebarNav() {
  const pathname = usePathname();
  let seccionAnterior: string | null = null;
  return (
    <nav className="space-y-1">
      {ADMIN_NAV_ITEMS.map((item) => {
        const activo = esActivo(pathname, item.href);
        const mostrarHeader = item.seccion !== seccionAnterior;
        seccionAnterior = item.seccion;
        return (
          <React.Fragment key={item.href}>
            {mostrarHeader && item.seccion && (
              <p className="mb-1 mt-4 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground first:mt-0">
                {item.seccion}
              </p>
            )}
            <Link
              href={item.href}
              className={cn(
                "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                activo
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/80 hover:bg-secondary hover:text-foreground",
              )}
            >
              {activo && (
                <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
              )}
              <item.icon className="size-4" />
              {item.label}
            </Link>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
