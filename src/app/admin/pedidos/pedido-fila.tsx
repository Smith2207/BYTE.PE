"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Receipt } from "lucide-react";

import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatoPEN } from "@/lib/format";
import type { PedidoMock } from "@/lib/pedidos/store";
import { ESTADO_PEDIDO_ESTILO, ESTADO_PEDIDO_ETIQUETA } from "@/components/pedidos/estado-pedido-badge";
import { actualizarEstadoPedidoAction } from "./actions";

const estados: PedidoMock["estado"][] = [
  "pendiente",
  "pagado",
  "preparando",
  "enviado",
  "entregado",
  "cancelado",
];

export function PedidoFila({ pedido }: { pedido: PedidoMock }) {
  const router = useRouter();
  const [courier, setCourier] = React.useState(pedido.courier ?? "");
  const [tracking, setTracking] = React.useState(pedido.numeroTracking ?? "");

  async function onEstadoChange(estado: string) {
    try {
      await actualizarEstadoPedidoAction(pedido.numeroPedido, estado as PedidoMock["estado"]);
      toast.success(`Pedido ${pedido.numeroPedido} → ${estado}`);
      router.refresh();
    } catch {
      toast.error("No se pudo actualizar el estado");
    }
  }

  async function guardarEnvio() {
    try {
      await actualizarEstadoPedidoAction(pedido.numeroPedido, pedido.estado, { courier, numeroTracking: tracking });
      toast.success("Datos de envío actualizados");
      router.refresh();
    } catch {
      toast.error("No se pudo guardar");
    }
  }

  return (
    <TableRow>
      <TableCell className="font-mono text-sm font-medium">{pedido.numeroPedido}</TableCell>
      <TableCell className="text-sm">
        {pedido.nombreComprador}
        <p className="text-xs text-muted-foreground">{pedido.emailComprador}</p>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {new Date(pedido.createdAt).toLocaleDateString("es-PE")}
      </TableCell>
      <TableCell className="font-medium">{formatoPEN(pedido.total)}</TableCell>
      <TableCell>
        <Select value={pedido.estado} onValueChange={onEstadoChange}>
          <SelectTrigger className={`h-8 w-36 ${ESTADO_PEDIDO_ESTILO[pedido.estado]}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {estados.map((e) => (
              <SelectItem key={e} value={e}>
                {ESTADO_PEDIDO_ETIQUETA[e]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1.5">
          <Input
            placeholder="Courier (Olva, Shalom...)"
            value={courier}
            onChange={(e) => setCourier(e.target.value)}
            className="h-8 text-xs"
          />
          <div className="flex gap-1.5">
            <Input
              placeholder="N° tracking"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              className="h-8 text-xs"
            />
            <button
              onClick={guardarEnvio}
              className="rounded-md border border-border/60 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Guardar
            </button>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">
          {pedido.metodoPago.replace("_", " ")}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="icon" asChild aria-label="Ver boleta">
          <Link href={`/pedido/${pedido.numeroPedido}/boleta`} target="_blank">
            <Receipt className="size-4" />
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  );
}
