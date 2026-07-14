"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Magnetic } from "@/components/fx/magnetic";
import { restablecerPasswordAction } from "../actions";

export function RestablecerContrasenaForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [confirmacion, setConfirmacion] = React.useState("");
  const [enviando, setEnviando] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmacion) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setEnviando(true);
    try {
      await restablecerPasswordAction(token, password);
      toast.success("Contraseña actualizada. Ya puedes iniciar sesión.");
      router.push("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo actualizar la contraseña");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password">Contraseña nueva</Label>
            <PasswordInput
              id="password"
              required
              minLength={6}
              className="mt-1.5"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="confirmacion">Confirmar contraseña</Label>
            <PasswordInput
              id="confirmacion"
              required
              minLength={6}
              className="mt-1.5"
              value={confirmacion}
              onChange={(e) => setConfirmacion(e.target.value)}
            />
          </div>
          <Magnetic strength={0.15} className="block">
            <Button type="submit" className="w-full" disabled={enviando}>
              {enviando ? <Loader2 className="size-4 animate-spin" /> : "Guardar contraseña"}
            </Button>
          </Magnetic>
        </form>
      </CardContent>
    </Card>
  );
}
