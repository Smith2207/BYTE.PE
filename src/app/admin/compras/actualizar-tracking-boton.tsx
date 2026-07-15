"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { actualizarTrackingCompraAction } from "./actions";

export function ActualizarTrackingBoton({
  compraId,
  tramo,
  disponible,
}: {
  compraId: string;
  tramo: "internacional" | "nacional";
  disponible: boolean;
}) {
  const router = useRouter();
  const [cargando, setCargando] = React.useState(false);

  async function onClick() {
    setCargando(true);
    try {
      await actualizarTrackingCompraAction(compraId, tramo);
      toast.success("Tracking actualizado");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo actualizar el tracking");
    } finally {
      setCargando(false);
    }
  }

  if (!disponible) {
    return (
      <span className="text-xs text-muted-foreground" title="Configura TRACKING_API_KEY para activar esto">
        Tracking automático no configurado
      </span>
    );
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick} disabled={cargando}>
      {cargando ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
      Actualizar tracking
    </Button>
  );
}
