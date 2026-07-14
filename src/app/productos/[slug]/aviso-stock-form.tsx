"use client";

import * as React from "react";
import { toast } from "sonner";
import { BellRing } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { registrarAvisoStock } from "./actions";

export function AvisoStockForm({ productoId }: { productoId: string }) {
  const [email, setEmail] = React.useState("");
  const [enviando, setEnviando] = React.useState(false);
  const [enviado, setEnviado] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setEnviando(true);
    try {
      await registrarAvisoStock({ productoId, email });
      setEnviado(true);
      toast.success("Te avisaremos apenas vuelva el stock");
    } catch {
      toast.error("No pudimos registrar tu correo, intenta de nuevo");
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <p className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm text-primary">
        <BellRing className="size-4" /> Te avisaremos a {email} cuando vuelva el stock.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
      <Input
        type="email"
        required
        placeholder="tu@correo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-11 sm:w-64"
      />
      <Button type="submit" variant="secondary" disabled={enviando} className="h-11">
        {enviando ? "Enviando..." : "Avísame cuando vuelva"}
      </Button>
    </form>
  );
}
