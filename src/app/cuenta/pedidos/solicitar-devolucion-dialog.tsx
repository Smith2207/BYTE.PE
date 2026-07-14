"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { solicitarDevolucionAction } from "./actions";

export function SolicitarDevolucionDialog({ numeroPedido }: { numeroPedido: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [tipo, setTipo] = React.useState<"reembolso" | "cambio">("reembolso");
  const [motivo, setMotivo] = React.useState("");
  const [enviando, setEnviando] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      await solicitarDevolucionAction(numeroPedido, { tipo, motivo });
      toast.success("Solicitud enviada — te contactaremos por correo");
      setOpen(false);
      setMotivo("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo enviar la solicitud");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Undo2 className="size-4" /> Solicitar devolución
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Solicitar devolución — {numeroPedido}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>¿Qué prefieres?</Label>
            <RadioGroup
              value={tipo}
              onValueChange={(v) => setTipo(v as "reembolso" | "cambio")}
              className="mt-2"
            >
              <label className="flex items-center gap-2 text-sm">
                <RadioGroupItem value="reembolso" /> Reembolso de mi dinero
              </label>
              <label className="flex items-center gap-2 text-sm">
                <RadioGroupItem value="cambio" /> Cambio por otro producto
              </label>
            </RadioGroup>
          </div>
          <div>
            <Label htmlFor="motivo">Cuéntanos qué pasó</Label>
            <Textarea
              id="motivo"
              className="mt-1.5"
              rows={4}
              placeholder="Ej: el producto llegó con la pantalla rota..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              required
              minLength={15}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={enviando}>
              {enviando ? <Loader2 className="size-4 animate-spin" /> : "Enviar solicitud"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
