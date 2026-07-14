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
import { actualizarCuponAction, eliminarCuponAction } from "./actions";

export function ToggleActivoCupon({ id, activo }: { id: string; activo: boolean }) {
  const router = useRouter();
  const [pendiente, setPendiente] = React.useState(false);

  async function onChange(checked: boolean) {
    setPendiente(true);
    try {
      await actualizarCuponAction(id, { activo: checked });
      router.refresh();
    } finally {
      setPendiente(false);
    }
  }

  return <Switch checked={activo} disabled={pendiente} onCheckedChange={onChange} />;
}

export function EliminarCuponBoton({ id, codigo }: { id: string; codigo: string }) {
  const router = useRouter();
  const [eliminando, setEliminando] = React.useState(false);

  async function onConfirm() {
    setEliminando(true);
    try {
      await eliminarCuponAction(id);
      toast.success("Cupón eliminado");
      router.refresh();
    } catch {
      toast.error("No se pudo eliminar el cupón");
    } finally {
      setEliminando(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Eliminar cupón">
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar el cupón &quot;{codigo}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
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
