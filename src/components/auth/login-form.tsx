"use client";

import * as React from "react";
import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, LogIn } from "lucide-react";
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
import { MODAL_CARD, MODAL_INPUT } from "@/lib/motion";

export function LoginForm({
  callbackUrl,
  onSwitchModo,
  onSuccess,
}: {
  callbackUrl?: string | null;
  onSwitchModo: () => void;
  onSuccess: () => void;
}) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [enviando, setEnviando] = React.useState(false);
  const { controls, shake } = useShake();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        toast.error("Correo o contraseña incorrectos");
        shake();
        return;
      }
      onSuccess();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <motion.div animate={controls}>
      <Card className={MODAL_CARD}>
        <CardContent className="space-y-5 pt-8">
          <StaggerFields className="space-y-5">
            <StaggerField className="flex flex-col items-center gap-3 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <LogIn className="size-6" strokeWidth={1.75} />
              </span>
              <div>
                <DialogPrimitive.Title className="text-xl font-bold font-display">
                  Inicia sesión
                </DialogPrimitive.Title>
                <p className="mt-1 text-sm text-muted-foreground">
                  Entra para ver tus pedidos, favoritos y direcciones guardadas.
                </p>
              </div>
            </StaggerField>
            <form onSubmit={onSubmit} className="space-y-4">
              <StaggerField>
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  className={`mt-1.5 ${MODAL_INPUT}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </StaggerField>
              <StaggerField>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link
                    href="/olvide-contrasena"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <PasswordInput
                  id="password"
                  required
                  className={`mt-1.5 ${MODAL_INPUT}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </StaggerField>
              <StaggerField>
                <Magnetic strength={0.15} className="block">
                  <Button type="submit" className="w-full" disabled={enviando}>
                    {enviando ? <Loader2 className="size-4 animate-spin" /> : "Iniciar sesión"}
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
                  className={`w-full ${MODAL_INPUT}`}
                  onClick={() => signIn("google", { callbackUrl: callbackUrl ?? "/cuenta" })}
                >
                  <GoogleIcon className="size-4" />
                  Continuar con Google
                </Button>
              </Magnetic>
            </StaggerField>

            <StaggerField>
              <p className="text-center text-sm text-muted-foreground">
                ¿No tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={onSwitchModo}
                  className="font-medium text-primary hover:underline"
                >
                  Regístrate
                </button>
              </p>
            </StaggerField>
          </StaggerFields>
        </CardContent>
      </Card>
    </motion.div>
  );
}
