"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { eliminarGastoAction } from "./actions";

export function EliminarGastoBoton({ id, descripcion }: { id: string; descripcion: string }) {
  const router = useRouter();
  const [eliminando, setEliminando] = React.useState(false);

  async function onConfirm() {
    setEliminando(true);
    try {
      await eliminarGastoAction(id);
      toast.success("Gasto eliminado");
      router.refresh();
    } catch {
      toast.error("No se pudo eliminar el gasto");
    } finally {
      setEliminando(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Eliminar gasto">
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar &quot;{descripcion}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. El gasto dejará de contarse en la utilidad neta.
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
