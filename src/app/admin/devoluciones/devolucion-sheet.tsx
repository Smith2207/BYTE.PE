"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { formatoPEN } from "@/lib/format";
import type { SolicitudDevolucionAlmacenada } from "@/lib/devoluciones/store";
import { EstadoDevolucionBadge } from "@/components/devoluciones/estado-devolucion-badge";
import { aprobarSolicitudAction, rechazarSolicitudAction, completarReembolsoAction } from "./actions";

export function DevolucionSheet({
  solicitud,
  trigger,
}: {
  solicitud: SolicitudDevolucionAlmacenada;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [notaRechazo, setNotaRechazo] = React.useState("");
  const [mostrarRechazo, setMostrarRechazo] = React.useState(false);
  const [monto, setMonto] = React.useState(solicitud.pedidoTotal.toFixed(2));
  const [procesando, setProcesando] = React.useState(false);

  async function aprobar() {
    setProcesando(true);
    try {
      await aprobarSolicitudAction(solicitud.id);
      toast.success("Solicitud aprobada — se notificó al cliente");
      router.refresh();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo aprobar");
    } finally {
      setProcesando(false);
    }
  }

  async function rechazar(e: React.FormEvent) {
    e.preventDefault();
    setProcesando(true);
    try {
      await rechazarSolicitudAction(solicitud.id, notaRechazo);
      toast.success("Solicitud rechazada — se notificó al cliente");
      router.refresh();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo rechazar");
    } finally {
      setProcesando(false);
    }
  }

  async function completar(e: React.FormEvent) {
    e.preventDefault();
    setProcesando(true);
    try {
      await completarReembolsoAction(solicitud.id, Number(monto));
      toast.success("Reembolso procesado: pedido actualizado y stock restaurado");
      router.refresh();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo procesar el reembolso");
    } finally {
      setProcesando(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {solicitud.tipo === "reembolso" ? "Reembolso" : "Cambio"} — {solicitud.pedidoNumero}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Estado</span>
            <EstadoDevolucionBadge estado={solicitud.estado} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Pedido</p>
              <Link
                href={`/admin/pedidos?q=${solicitud.pedidoNumero}`}
                className="font-mono text-xs text-primary hover:underline"
              >
                {solicitud.pedidoNumero}
              </Link>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total del pedido</p>
              <p>{formatoPEN(solicitud.pedidoTotal)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Solicitado</p>
              <p>{new Date(solicitud.createdAt).toLocaleDateString("es-PE")}</p>
            </div>
            {solicitud.resueltoEn && (
              <div>
                <p className="text-xs text-muted-foreground">Resuelto</p>
                <p>{new Date(solicitud.resueltoEn).toLocaleDateString("es-PE")}</p>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <p className="mb-1 text-xs text-muted-foreground">Motivo del cliente</p>
            <p className="whitespace-pre-wrap rounded-lg bg-secondary/50 p-3">{solicitud.motivo}</p>
          </div>

          {solicitud.notaAdmin && (
            <div>
              <p className="mb-1 text-xs text-muted-foreground">
                {solicitud.estado === "rechazada" ? "Motivo del rechazo" : "Nota interna"}
              </p>
              <p className="whitespace-pre-wrap rounded-lg bg-secondary/50 p-3">
                {solicitud.notaAdmin}
              </p>
            </div>
          )}

          {solicitud.montoReembolsado != null && (
            <div>
              <p className="text-xs text-muted-foreground">Monto reembolsado</p>
              <p className="text-base font-semibold">{formatoPEN(solicitud.montoReembolsado)}</p>
            </div>
          )}
        </div>

        <Separator className="my-6" />

        {solicitud.estado === "pendiente" && !mostrarRechazo && (
          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setMostrarRechazo(true)}
              disabled={procesando}
            >
              Rechazar
            </Button>
            <Button type="button" onClick={aprobar} disabled={procesando}>
              {procesando ? <Loader2 className="size-4 animate-spin" /> : "Aprobar solicitud"}
            </Button>
          </SheetFooter>
        )}

        {solicitud.estado === "pendiente" && mostrarRechazo && (
          <form onSubmit={rechazar} className="space-y-4">
            <div>
              <Label htmlFor="notaRechazo">Motivo del rechazo</Label>
              <Textarea
                id="notaRechazo"
                className="mt-1.5"
                rows={3}
                placeholder="Se le envía este motivo al cliente por correo."
                value={notaRechazo}
                onChange={(e) => setNotaRechazo(e.target.value)}
                required
                minLength={5}
              />
            </div>
            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setMostrarRechazo(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="destructive" disabled={procesando}>
                {procesando ? <Loader2 className="size-4 animate-spin" /> : "Confirmar rechazo"}
              </Button>
            </SheetFooter>
          </form>
        )}

        {solicitud.estado === "aprobada" && solicitud.tipo === "reembolso" && (
          <form onSubmit={completar} className="space-y-4">
            <div>
              <Label htmlFor="monto">Monto a reembolsar (S/)</Label>
              <Input
                id="monto"
                type="number"
                step="0.01"
                min="0"
                className="mt-1.5"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Al confirmar, el pedido pasa a &quot;Reembolsado&quot; y el stock de los
                productos se restaura automáticamente.
              </p>
            </div>
            <SheetFooter>
              <Button type="submit" disabled={procesando}>
                {procesando ? <Loader2 className="size-4 animate-spin" /> : "Procesar reembolso"}
              </Button>
            </SheetFooter>
          </form>
        )}

        {solicitud.estado === "aprobada" && solicitud.tipo === "cambio" && (
          <p className="text-sm text-muted-foreground">
            Coordina el cambio directamente con el cliente. Este flujo automatizado solo cubre
            reembolsos de dinero.
          </p>
        )}
      </SheetContent>
    </Sheet>
  );
}
