"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GoogleIcon } from "@/components/icons/google-icon";
import { Magnetic } from "@/components/fx/magnetic";
import { StaggerFields, StaggerField } from "@/components/fx/stagger-fields";
import { useShake } from "@/components/fx/use-shake";
import { MODAL_CARD } from "@/lib/motion";
import { registrarUsuarioAction } from "@/app/registro/actions";

export function RegistroForm({
  callbackUrl,
  onSwitchModo,
  onSuccess,
}: {
  callbackUrl?: string | null;
  onSwitchModo: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = React.useState({ nombre: "", email: "", password: "" });
  const [enviando, setEnviando] = React.useState(false);
  const { controls, shake } = useShake();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      await registrarUsuarioAction(form);
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (res?.error) {
        toast.error("Cuenta creada, pero no se pudo iniciar sesión automáticamente");
        onSwitchModo();
        return;
      }
      toast.success("¡Cuenta creada!");
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo crear la cuenta");
      shake();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <motion.div animate={controls}>
      <Card className={MODAL_CARD}>
        <CardContent className="pt-6">
          <StaggerFields className="space-y-4">
            <form onSubmit={onSubmit} className="space-y-4">
              <StaggerField>
                <Label htmlFor="nombre">Nombre completo</Label>
                <Input
                  id="nombre"
                  required
                  className="mt-1.5"
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                />
              </StaggerField>
              <StaggerField>
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  className="mt-1.5"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </StaggerField>
              <StaggerField>
                <Label htmlFor="password">Contraseña</Label>
                <PasswordInput
                  id="password"
                  required
                  minLength={6}
                  className="mt-1.5"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                />
              </StaggerField>
              <StaggerField>
                <Magnetic strength={0.15} className="block">
                  <Button type="submit" className="w-full" disabled={enviando}>
                    {enviando ? <Loader2 className="size-4 animate-spin" /> : "Crear cuenta"}
                  </Button>
                </Magnetic>
              </StaggerField>
            </form>

            <StaggerField className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">o</span>
              <Separator className="flex-1" />
            </StaggerField>

            <StaggerField>
              <Magnetic strength={0.15} className="block">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => signIn("google", { callbackUrl: callbackUrl ?? "/cuenta" })}
                >
                  <GoogleIcon className="size-4" />
                  Continuar con Google
                </Button>
              </Magnetic>
            </StaggerField>

            <StaggerField>
              <p className="text-center text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={onSwitchModo}
                  className="font-medium text-primary hover:underline"
                >
                  Inicia sesión
                </button>
              </p>
            </StaggerField>
          </StaggerFields>
        </CardContent>
      </Card>
    </motion.div>
  );
}
