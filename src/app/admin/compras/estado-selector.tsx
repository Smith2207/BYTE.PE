"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CompraAlmacenada } from "@/lib/compras/store";
import { actualizarEstadoCompraAction } from "./actions";
import { ESTADO_COMPRA_ETIQUETA } from "./compras-filtros";

const estados: CompraAlmacenada["estado"][] = [
  "pedido",
  "en_almacen_usa",
  "en_transito",
  "aduana",
  "recibido",
  "cancelado",
];

export function EstadoCompraSelector({ id, estado }: { id: string; estado: CompraAlmacenada["estado"] }) {
  const router = useRouter();

  async function onChange(nuevoEstado: string) {
    try {
      await actualizarEstadoCompraAction(id, nuevoEstado as CompraAlmacenada["estado"]);
      if (nuevoEstado === "recibido") {
        toast.success("Compra recibida: stock y costo de los productos actualizados");
      } else {
        toast.success("Estado actualizado");
      }
      router.refresh();
    } catch {
      toast.error("No se pudo actualizar el estado");
    }
  }

  return (
    <Select value={estado} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {estados.map((e) => (
          <SelectItem key={e} value={e}>
            {ESTADO_COMPRA_ETIQUETA[e]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
