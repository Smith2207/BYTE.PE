"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { actualizarCourierAction, eliminarCourierAction } from "./actions";

export function ToggleActivoCourier({ id, activo }: { id: string; activo: boolean }) {
  const router = useRouter();
  const [pendiente, setPendiente] = React.useState(false);

  async function onChange(checked: boolean) {
    setPendiente(true);
    try {
      await actualizarCourierAction(id, { activo: checked });
      router.refresh();
    } finally {
      setPendiente(false);
    }
  }

  return <Switch checked={activo} disabled={pendiente} onCheckedChange={onChange} />;
}

export function EliminarCourierBoton({ id, nombre }: { id: string; nombre: string }) {
  const router = useRouter();
  const [eliminando, setEliminando] = React.useState(false);

  async function onConfirm() {
    setEliminando(true);
    try {
      await eliminarCourierAction(id);
      toast.success("Courier eliminado");
      router.refresh();
    } catch {
      toast.error("No se pudo eliminar el courier");
    } finally {
      setEliminando(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Eliminar courier">
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar &quot;{nombre}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            También se eliminan sus tarifas guardadas. Los pedidos que ya usaron este courier no
            se ven afectados (el nombre queda como texto en el pedido).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction disabled={eliminando} onClick={onConfirm}>
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
