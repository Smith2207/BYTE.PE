"use client";

import * as React from "react";
import { MailWarning, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { reenviarVerificacionEmailAction } from "./actions";

export function VerificacionEmailBanner() {
  const [enviando, setEnviando] = React.useState(false);
  const [enviado, setEnviado] = React.useState(false);

  async function onReenviar() {
    setEnviando(true);
    try {
      await reenviarVerificacionEmailAction();
      setEnviado(true);
      toast.success("Te enviamos un correo de confirmación");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo enviar el correo");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm sm:flex-row sm:items-center">
      <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
        <MailWarning className="size-4 shrink-0" />
        Todavía no confirmaste tu correo.
      </div>
      <Button variant="outline" size="sm" disabled={enviando || enviado} onClick={onReenviar}>
        {enviando ? <Loader2 className="size-4 animate-spin" /> : enviado ? "Enviado" : "Reenviar"}
      </Button>
    </div>
  );
}
