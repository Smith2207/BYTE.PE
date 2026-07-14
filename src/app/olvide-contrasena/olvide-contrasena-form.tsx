"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";
import { Magnetic } from "@/components/fx/magnetic";
import { solicitarResetPasswordAction } from "./actions";

export function OlvideContrasenaForm() {
  const [email, setEmail] = React.useState("");
  const [enviando, setEnviando] = React.useState(false);
  const [enviado, setEnviado] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      await solicitarResetPasswordAction(email);
      setEnviado(true);
    } catch {
      toast.error("Ingresa un correo válido");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {enviado ? (
          <RevealOnScroll y={16}>
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 className="size-10 text-emerald-500" />
              <p className="text-sm text-foreground">
                Si <strong>{email}</strong> tiene una cuenta con nosotros, te enviamos un correo con
                instrucciones para crear una contraseña nueva.
              </p>
              <Link href="/login" className="text-sm font-medium text-primary hover:underline">
                Volver a iniciar sesión
              </Link>
            </div>
          </RevealOnScroll>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                required
                className="mt-1.5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Magnetic strength={0.15} className="block">
              <Button type="submit" className="w-full" disabled={enviando}>
                {enviando ? <Loader2 className="size-4 animate-spin" /> : "Enviar enlace"}
              </Button>
            </Magnetic>
            <p className="text-center text-sm text-muted-foreground">
              <Link href="/login" className="font-medium text-primary hover:underline">
                Volver a iniciar sesión
              </Link>
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
