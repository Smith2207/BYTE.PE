"use client";

import * as React from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Download, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { GLASS_CARD } from "@/lib/motion";
import { eliminarCuentaAction, exportarMisDatosAction } from "./actions";

const FRASE_CONFIRMACION = "ELIMINAR";

export function PrivacidadCard() {
  const [exportando, setExportando] = React.useState(false);
  const [eliminando, setEliminando] = React.useState(false);
  const [confirmacion, setConfirmacion] = React.useState("");

  async function onExportar() {
    setExportando(true);
    try {
      const datos = await exportarMisDatosAction();
      const blob = new Blob([JSON.stringify(datos, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mis-datos-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo generar la descarga");
    } finally {
      setExportando(false);
    }
  }

  async function onEliminar() {
    setEliminando(true);
    try {
      await eliminarCuentaAction();
      toast.success("Tu cuenta fue eliminada");
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar la cuenta");
      setEliminando(false);
    }
  }

  return (
    <Card className={GLASS_CARD}>
      <CardContent className="space-y-4 pt-6">
        <h2 className="text-sm font-semibold">Privacidad y datos</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm">Descargar mis datos</p>
            <p className="text-xs text-muted-foreground">
              Un archivo con tu perfil, direcciones, pedidos, wishlist y reseñas.
            </p>
          </div>
          <Button variant="outline" size="sm" disabled={exportando} onClick={onExportar}>
            {exportando ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            Descargar
          </Button>
        </div>

        <div className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm">Eliminar mi cuenta</p>
            <p className="text-xs text-muted-foreground">
              Borra tu perfil, direcciones, wishlist y reseñas. No se puede deshacer.
            </p>
          </div>
          <AlertDialog onOpenChange={(open) => !open && setConfirmacion("")}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="size-4" /> Eliminar cuenta
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar tu cuenta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Tus pedidos se conservan como comprobante de
                  compra (obligatorio por ley), pero dejan de estar ligados a tu cuenta y ya no
                  podrás verlos desde acá. Escribe <strong>{FRASE_CONFIRMACION}</strong> para
                  confirmar.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-1.5">
                <Label htmlFor="confirmar-eliminar" className="sr-only">
                  Confirmación
                </Label>
                <Input
                  id="confirmar-eliminar"
                  value={confirmacion}
                  onChange={(e) => setConfirmacion(e.target.value)}
                  placeholder={FRASE_CONFIRMACION}
                  autoComplete="off"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  disabled={confirmacion !== FRASE_CONFIRMACION || eliminando}
                  onClick={onEliminar}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {eliminando ? <Loader2 className="size-4 animate-spin" /> : "Eliminar cuenta"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
