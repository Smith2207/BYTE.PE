"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ADMIN_NAV_ITEMS } from "./admin-sidebar-nav";
import { cn } from "@/lib/utils";

/** Nombre del evento con el que otros componentes (ej. el botón ⌘K de la
 * topbar) piden abrir el palette sin necesidad de levantar estado. */
export const ABRIR_COMMAND_PALETTE_EVENT = "admin:abrir-command-palette";

export function AdminCommandPalette() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [indiceActivo, setIndiceActivo] = React.useState(0);

  const resultados = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? ADMIN_NAV_ITEMS.filter((item) => item.label.toLowerCase().includes(q)) : ADMIN_NAV_ITEMS;
  }, [query]);

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    function onEvento() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(ABRIR_COMMAND_PALETTE_EVENT, onEvento);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(ABRIR_COMMAND_PALETTE_EVENT, onEvento);
    };
  }, []);

  React.useEffect(() => {
    if (open) {
      setQuery("");
      setIndiceActivo(0);
    }
  }, [open]);

  React.useEffect(() => {
    setIndiceActivo(0);
  }, [query]);

  function ir(href: string) {
    setOpen(false);
    router.push(href);
  }

  function onKeyDownInput(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndiceActivo((i) => Math.min(i + 1, resultados.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndiceActivo((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = resultados[indiceActivo];
      if (item) ir(item.href);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md gap-0 p-0">
        <DialogTitle className="sr-only">Navegar en el panel admin</DialogTitle>
        <div className="flex items-center gap-2 border-b border-border/60 px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDownInput}
            placeholder="Ir a una sección del panel..."
            className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-72 overflow-y-auto p-1.5">
          {resultados.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">Sin resultados.</p>
          ) : (
            resultados.map((item, i) => (
              <button
                key={item.href}
                type="button"
                onClick={() => ir(item.href)}
                onMouseEnter={() => setIndiceActivo(i)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition",
                  i === indiceActivo
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/80 hover:bg-secondary",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
