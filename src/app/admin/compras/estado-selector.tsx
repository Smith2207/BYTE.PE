"use client";

import * as React from "react";
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
import { ConfirmarRecepcionDialog } from "./confirmar-recepcion-dialog";

const estados: CompraAlmacenada["estado"][] = [
  "pedido",
  "en_almacen_usa",
  "en_transito",
  "aduana",
  "recibido",
  "cancelado",
];

const estadosLocal: CompraAlmacenada["estado"][] = ["pedido", "recibido", "cancelado"];

export function EstadoCompraSelector({
  id,
  estado,
  tipoEnvio,
  tieneItemsNuevos,
}: {
  id: string;
  estado: CompraAlmacenada["estado"];
  tipoEnvio: CompraAlmacenada["tipoEnvio"];
  // Si hay productos nuevos (aún no en catálogo) en esta compra, marcarla
  // "recibido" abre el diálogo de precio sugerido en vez de aplicarse directo.
  tieneItemsNuevos: boolean;
}) {
  const router = useRouter();
  const [dialogoAbierto, setDialogoAbierto] = React.useState(false);

  // "En almacén USA"/"en tránsito"/"aduana" no aplican a compras locales ni
  // a las que van directo a Perú sin forwarder — se ocultan esos pasos en
  // vez de mostrar estados que nunca pasan para ese tipo de envío.
  const estadosDisponibles =
    tipoEnvio === "local"
      ? estadosLocal
      : tipoEnvio === "directo_peru"
        ? estados.filter((e) => e !== "en_almacen_usa")
        : estados;

  async function onChange(nuevoEstado: string) {
    if (nuevoEstado === "recibido" && estado !== "recibido" && tieneItemsNuevos) {
      setDialogoAbierto(true);
      return;
    }
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
    <>
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
      <ConfirmarRecepcionDialog
        compraId={id}
        open={dialogoAbierto}
        onOpenChange={setDialogoAbierto}
        onConfirmado={() => router.refresh()}
      />
    </>
  );
}
