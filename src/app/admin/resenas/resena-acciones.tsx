"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { moderarResenaAction } from "./actions";

export function ResenaAcciones({ id }: { id: string }) {
  const router = useRouter();
  const [enviando, setEnviando] = React.useState<"publicada" | "rechazada" | null>(null);

  async function moderar(estado: "publicada" | "rechazada") {
    setEnviando(estado);
    try {
      await moderarResenaAction(id, estado);
      toast.success(estado === "publicada" ? "Reseña publicada" : "Reseña rechazada");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo actualizar la reseña");
    } finally {
      setEnviando(null);
    }
  }

  return (
    <div className="flex justify-end gap-1.5">
      <Button
        variant="outline"
        size="sm"
        className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-500"
        disabled={enviando !== null}
        onClick={() => moderar("rechazada")}
      >
        {enviando === "rechazada" ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
      </Button>
      <Button
        size="sm"
        className="bg-emerald-500 text-white hover:bg-emerald-600"
        disabled={enviando !== null}
        onClick={() => moderar("publicada")}
      >
        {enviando === "publicada" ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
      </Button>
    </div>
  );
}
