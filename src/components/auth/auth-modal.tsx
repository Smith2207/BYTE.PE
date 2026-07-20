"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { RegistroForm } from "@/components/auth/registro-form";

/** Login/registro como overlay sobre la página actual — nunca una ruta
 * aparte. El modo se lee de la URL (?auth=login|registro) para que se
 * pueda abrir desde cualquier link/botón del sitio sin navegar (ver
 * useAbrirAuthModal) y para que el middleware pueda mandar acá a un
 * usuario sin sesión que intentó entrar a una ruta protegida
 * (?callbackUrl=/ruta/protegida). Cerrar (click afuera, Escape, ✕)
 * siempre vuelve a la página actual sin el modal — nunca dispara una
 * navegación nueva. */
export function AuthModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const modo = searchParams.get("auth");
  const callbackUrl = searchParams.get("callbackUrl");
  const abierto = modo === "login" || modo === "registro";
  const reducida = useReducedMotion();

  function cerrar() {
    router.push(pathname);
  }

  function cambiarModo(nuevo: "login" | "registro") {
    const params = new URLSearchParams(searchParams);
    params.set("auth", nuevo);
    router.replace(`${pathname}?${params.toString()}`);
  }

  function onSuccess() {
    router.push(callbackUrl || pathname);
    router.refresh();
  }

  return (
    <DialogPrimitive.Root
      open={abierto}
      onOpenChange={(open) => {
        if (!open) cerrar();
      }}
    >
      <AnimatePresence>
        {abierto && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                initial={reducida ? undefined : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reducida ? undefined : { opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content
              asChild
              forceMount
              onOpenAutoFocus={(e) => e.preventDefault()}
              aria-describedby={undefined}
            >
              {/* Centrado con un elemento propio, sin animación — si el
                  centrado (-translate-x/y-1/2) viviera en el mismo nodo que
                  anima framer-motion, el `transform` inline que motion pone
                  para scale/y pisaría por completo esas clases de Tailwind y
                  el modal quedaría descentrado todo el tiempo, no solo
                  durante la transición. */}
              <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 px-4">
                <motion.div
                  className="max-h-[85vh] overflow-y-auto focus:outline-none"
                  initial={reducida ? undefined : { opacity: 0, scale: 0.95, y: 24 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={reducida ? undefined : { opacity: 0, scale: 0.95, y: 16 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <DialogPrimitive.Title className="mb-4 text-center text-2xl font-bold font-display">
                    {modo === "registro" ? "Crear cuenta" : "Iniciar sesión"}
                  </DialogPrimitive.Title>
                  {modo === "registro" ? (
                    <RegistroForm
                      callbackUrl={callbackUrl}
                      onSwitchModo={() => cambiarModo("login")}
                      onSuccess={onSuccess}
                    />
                  ) : (
                    <LoginForm
                      callbackUrl={callbackUrl}
                      onSwitchModo={() => cambiarModo("registro")}
                      onSuccess={onSuccess}
                    />
                  )}
                </motion.div>
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
