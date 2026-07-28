"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GLASS_CARD } from "@/lib/motion";
import {
  confirmarActivacionTotpAction,
  desactivarTotpAction,
  iniciarActivacionTotpAction,
} from "./seguridad-actions";

export function SeguridadCard({ totpHabilitado, tienePassword }: { totpHabilitado: boolean; tienePassword: boolean }) {
  const router = useRouter();
  const [habilitado, setHabilitado] = React.useState(totpHabilitado);

  return (
    <Card className={GLASS_CARD}>
      <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold">Verificación en dos pasos</h2>
          <p className="text-xs text-muted-foreground">
            {habilitado
              ? "Activada — se pide un código además de tu contraseña al iniciar sesión."
              : "Agrega una capa extra de seguridad a tu cuenta con una app de autenticación (Google Authenticator, Authy, etc.)."}
          </p>
        </div>
        {habilitado ? (
          <DesactivarDialog
            onDesactivado={() => {
              setHabilitado(false);
              router.refresh();
            }}
            tienePassword={tienePassword}
          />
        ) : (
          <ActivarDialog
            onActivado={() => {
              setHabilitado(true);
              router.refresh();
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}

function ActivarDialog({ onActivado }: { onActivado: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [cargando, setCargando] = React.useState(false);
  const [confirmando, setConfirmando] = React.useState(false);
  const [datos, setDatos] = React.useState<{ secret: string; qr: string } | null>(null);
  const [codigo, setCodigo] = React.useState("");

  async function abrir(abierto: boolean) {
    setOpen(abierto);
    if (abierto && !datos) {
      setCargando(true);
      try {
        setDatos(await iniciarActivacionTotpAction());
      } catch {
        toast.error("No se pudo generar el código QR");
        setOpen(false);
      } finally {
        setCargando(false);
      }
    }
    if (!abierto) {
      setDatos(null);
      setCodigo("");
    }
  }

  async function confirmar() {
    if (!datos) return;
    setConfirmando(true);
    try {
      await confirmarActivacionTotpAction(datos.secret, codigo);
      toast.success("Verificación en dos pasos activada");
      setOpen(false);
      setDatos(null);
      setCodigo("");
      onActivado();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo activar");
    } finally {
      setConfirmando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={abrir}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ShieldCheck className="size-4" /> Activar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Activar verificación en dos pasos</DialogTitle>
          <DialogDescription>
            Escanea el código con tu app de autenticación (Google Authenticator, Authy, 1Password...)
            y escribe el código de 6 dígitos que te muestre para confirmar.
          </DialogDescription>
        </DialogHeader>

        {cargando ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : datos ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Image
                src={datos.qr}
                alt="Código QR para activar verificación en dos pasos"
                width={200}
                height={200}
                className="rounded-lg border border-border"
                unoptimized
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">O ingresa este código manualmente</Label>
              <p className="mt-1 break-all rounded-lg bg-secondary/50 p-2 font-mono text-xs">
                {datos.secret}
              </p>
            </div>
            <div>
              <Label htmlFor="codigo-activacion">Código de 6 dígitos</Label>
              <Input
                id="codigo-activacion"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                className="mt-1.5"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
              />
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button disabled={!datos || confirmando || codigo.length < 6} onClick={confirmar}>
            {confirmando ? <Loader2 className="size-4 animate-spin" /> : "Confirmar y activar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DesactivarDialog({
  onDesactivado,
  tienePassword,
}: {
  onDesactivado: () => void;
  tienePassword: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [enviando, setEnviando] = React.useState(false);

  async function confirmar() {
    setEnviando(true);
    try {
      await desactivarTotpAction(tienePassword ? password : undefined);
      toast.success("Verificación en dos pasos desactivada");
      setOpen(false);
      setPassword("");
      onDesactivado();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo desactivar");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <ShieldOff className="size-4" /> Desactivar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Desactivar verificación en dos pasos?</DialogTitle>
          <DialogDescription>
            Tu cuenta quedará protegida solo por tu contraseña.
            {tienePassword && " Confirma tu contraseña para continuar."}
          </DialogDescription>
        </DialogHeader>
        {tienePassword && (
          <div>
            <Label htmlFor="password-desactivar">Contraseña</Label>
            <PasswordInput
              id="password-desactivar"
              className="mt-1.5"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            disabled={enviando || (tienePassword && !password)}
            onClick={confirmar}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {enviando ? <Loader2 className="size-4 animate-spin" /> : "Desactivar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
