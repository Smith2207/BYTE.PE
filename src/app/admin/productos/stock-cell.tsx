"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Loader2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { actualizarProductoAction } from "./actions";

/** Editar el stock sin abrir el formulario completo — lo más repetitivo
 * del día a día ("llegó mercadería, subo el stock") no debería requerir
 * navegar 4 secciones de un sheet para cambiar un solo número. */
export function StockCell({ productoId, stock }: { productoId: string; stock: number }) {
  const router = useRouter();
  const [editando, setEditando] = React.useState(false);
  const [valor, setValor] = React.useState(stock.toString());
  const [guardando, setGuardando] = React.useState(false);

  async function guardar() {
    const nuevoStock = Number(valor);
    if (!Number.isInteger(nuevoStock) || nuevoStock < 0) {
      toast.error("Ingresa un stock válido");
      return;
    }
    if (nuevoStock === stock) {
      setEditando(false);
      return;
    }
    setGuardando(true);
    try {
      await actualizarProductoAction(productoId, { stock: nuevoStock });
      toast.success("Stock actualizado");
      setEditando(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo actualizar el stock");
    } finally {
      setGuardando(false);
    }
  }

  if (editando) {
    return (
      <div className="flex items-center gap-1">
        <Input
          type="number"
          min="0"
          autoFocus
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") guardar();
            if (e.key === "Escape") setEditando(false);
          }}
          className="h-7 w-16 px-2 text-xs"
        />
        <button
          onClick={guardar}
          disabled={guardando}
          aria-label="Guardar stock"
          className="text-emerald-500 hover:text-emerald-400"
        >
          {guardando ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
        </button>
        <button
          onClick={() => setEditando(false)}
          aria-label="Cancelar"
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setEditando(true)} aria-label="Editar stock">
      <Badge
        variant={stock === 0 ? "destructive" : stock <= 5 ? "secondary" : "outline"}
        className="cursor-pointer transition hover:opacity-80"
      >
        {stock}
      </Badge>
    </button>
  );
}
