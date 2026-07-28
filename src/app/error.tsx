"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";
import { reportarErrorClienteAction } from "./error-actions";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[error boundary]", error);
    reportarErrorClienteAction(error.message, error.digest).catch(() => {});
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-24">
      <RevealOnScroll className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-24 text-center">
        <TriangleAlert className="size-10 text-muted-foreground" />
        <p className="mt-4 text-lg font-semibold">Algo salió mal</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Tuvimos un problema para cargar esta página. Podés intentar de nuevo o volver al inicio.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={() => reset()}>
            Reintentar
          </Button>
          <Button asChild>
            <Link href="/">Ir al inicio</Link>
          </Button>
        </div>
      </RevealOnScroll>
    </div>
  );
}
