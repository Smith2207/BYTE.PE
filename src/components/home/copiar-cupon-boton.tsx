"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CopiarCuponBoton({ codigo }: { codigo: string }) {
  const [copiado, setCopiado] = React.useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      toast.success(`Código "${codigo}" copiado`);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      toast.error("No se pudo copiar el código");
    }
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={copiar}
      className="gap-2 rounded-full font-mono"
    >
      {copiado ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {codigo}
    </Button>
  );
}
