"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { ReclamoAlmacenado } from "@/lib/reclamos/store";
import type { EstadoReclamo } from "@/db/schema/enums";
import { ESTADO_RECLAMO_ETIQUETA } from "./estado-reclamo-badge";
import { responderReclamoAction } from "./actions";

const ESTADOS: EstadoReclamo[] = ["registrado", "en_proceso", "resuelto"];

export function ReclamoSheet({
  reclamo,
  trigger,
}: {
  reclamo: ReclamoAlmacenado;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [estado, setEstado] = React.useState<EstadoReclamo>(reclamo.estado);
  const [respuesta, setRespuesta] = React.useState(reclamo.respuesta ?? "");
  const [enviando, setEnviando] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      await responderReclamoAction(reclamo.id, { estado, respuesta });
      toast.success("Respuesta enviada al cliente por correo");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo enviar la respuesta");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {reclamo.tipo === "queja" ? "Queja" : "Reclamo"} — {reclamo.folio}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Fecha</p>
              <p>{new Date(reclamo.createdAt).toLocaleDateString("es-PE")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tipo de bien</p>
              <p className="capitalize">{reclamo.tipoBien ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reclamante</p>
              <p>
                {reclamo.nombre} {reclamo.apellidos}
                {reclamo.esMenorEdad && (
                  <span className="ml-1 text-xs text-amber-500">(menor de edad)</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Documento</p>
              <p className="uppercase">
                {reclamo.tipoDocumento} {reclamo.numeroDocumento}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Correo</p>
              <p className="break-all">{reclamo.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Teléfono</p>
              <p>{reclamo.telefono ?? "—"}</p>
            </div>
            {reclamo.domicilio && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Domicilio</p>
                <p>{reclamo.domicilio}</p>
              </div>
            )}
            {reclamo.montoReclamado != null && (
              <div>
                <p className="text-xs text-muted-foreground">Monto reclamado</p>
                <p>{formatoPEN(reclamo.montoReclamado)}</p>
              </div>
            )}
            {reclamo.pedidoNumero && (
              <div>
                <p className="text-xs text-muted-foreground">Pedido asociado</p>
                <Link
                  href={`/admin/pedidos?q=${reclamo.pedidoNumero}`}
                  className="font-mono text-xs text-primary hover:underline"
                >
                  {reclamo.pedidoNumero}
                </Link>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <p className="mb-1 text-xs text-muted-foreground">Descripción del bien/servicio</p>
            <p>{reclamo.descripcionBien ?? "—"}</p>
          </div>

          <div>
            <p className="mb-1 text-xs text-muted-foreground">Detalle del {reclamo.tipo}</p>
            <p className="whitespace-pre-wrap rounded-lg bg-secondary/50 p-3">
              {reclamo.detalleReclamo}
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="estado">Estado</Label>
            <Select value={estado} onValueChange={(v) => setEstado(v as EstadoReclamo)}>
              <SelectTrigger id="estado" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS.map((e) => (
                  <SelectItem key={e} value={e}>
                    {ESTADO_RECLAMO_ETIQUETA[e]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="respuesta">Respuesta para el cliente</Label>
            <Textarea
              id="respuesta"
              className="mt-1.5"
              rows={5}
              placeholder="Explica cómo se resolvió o el siguiente paso — se envía por correo al cliente."
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              required
              minLength={10}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Al guardar, se le envía esta respuesta por correo a {reclamo.email}.
            </p>
          </div>
          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={enviando}>
              {enviando ? <Loader2 className="size-4 animate-spin" /> : "Guardar y enviar"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
