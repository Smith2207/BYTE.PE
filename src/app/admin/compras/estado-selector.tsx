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

export function EstadoCompraSelector({
  id,
  estado,
  tipoEnvio,
}: {
  id: string;
  estado: CompraAlmacenada["estado"];
  tipoEnvio: CompraAlmacenada["tipoEnvio"];
}) {
  const router = useRouter();
  // "En almacén USA" no aplica a compras que van directo a Perú (sin
  // forwarder) — se oculta esa opción en vez de mostrar un paso que nunca
  // pasa para ese tipo de envío.
  const estadosDisponibles =
    tipoEnvio === "directo_peru" ? estados.filter((e) => e !== "en_almacen_usa") : estados;

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
        {estadosDisponibles.map((e) => (
          <SelectItem key={e} value={e}>
            {ESTADO_COMPRA_ETIQUETA[e]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
