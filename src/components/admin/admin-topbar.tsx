"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Bell, LogOut, Search, ShieldAlert, User } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ABRIR_COMMAND_PALETTE_EVENT } from "./admin-command-palette";

export function AdminTopbar({
  pedidosPendientes,
  alertasStock,
}: {
  pedidosPendientes: number;
  alertasStock: number;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [busqueda, setBusqueda] = React.useState("");
  const totalNotificaciones = pedidosPendientes + alertasStock;

  function onBuscar(e: React.FormEvent) {
    e.preventDefault();
    if (!busqueda.trim()) return;
    router.push(`/admin/productos?q=${encodeURIComponent(busqueda.trim())}`);
  }

  return (
    <div className="mb-6 flex items-center gap-3">
      <form onSubmit={onBuscar} className="relative flex-1 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar productos por nombre o SKU..."
          className="h-9 rounded-full bg-secondary/60 pl-9"
        />
      </form>

      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event(ABRIR_COMMAND_PALETTE_EVENT))}
        className="hidden items-center gap-1 rounded-md border border-border/60 px-2 py-1 text-xs text-muted-foreground transition hover:bg-secondary hover:text-foreground sm:flex"
        aria-label="Abrir navegación rápida"
      >
        <kbd className="font-sans">⌘</kbd>
        <kbd className="font-sans">K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative flex size-9 items-center justify-center rounded-full text-foreground/70 transition hover:bg-secondary hover:text-foreground"
              aria-label="Notificaciones"
            >
              <Bell className="size-4.5" />
              {totalNotificaciones > 0 && (
                <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                  {totalNotificaciones}
                </Badge>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {totalNotificaciones === 0 ? (
              <p className="px-2 py-3 text-sm text-muted-foreground">Todo al día — sin pendientes.</p>
            ) : (
              <>
                {pedidosPendientes > 0 && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/pedidos">
                      <Bell className="size-4 text-amber-500" />
                      {pedidosPendientes} pedido(s) pendiente(s) de verificar
                    </Link>
                  </DropdownMenuItem>
                )}
                {alertasStock > 0 && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/productos">
                      <ShieldAlert className="size-4 text-red-500" />
                      {alertasStock} producto(s) con stock bajo o agotado
                    </Link>
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex size-9 items-center justify-center rounded-full bg-secondary text-foreground/80 transition hover:text-foreground"
              aria-label="Cuenta"
            >
              <User className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="truncate">
              {session?.user?.name ?? session?.user?.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
              <LogOut className="size-4" /> Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
