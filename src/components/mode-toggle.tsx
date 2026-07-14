"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // next-themes no sabe el tema real hasta montar en el cliente (SSR no
  // conoce la preferencia guardada) — evita el parpadeo/mismatch mostrando
  // un botón deshabilitado hasta ese momento.
  const [montado, setMontado] = React.useState(false);
  React.useEffect(() => setMontado(true), []);

  const esOscuro = montado && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={!montado}
      aria-label={esOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      onClick={() => setTheme(esOscuro ? "light" : "dark")}
    >
      {esOscuro ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  );
}
