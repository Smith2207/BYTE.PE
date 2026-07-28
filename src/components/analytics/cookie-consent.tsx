"use client";

import * as React from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "ecomers_cookies_consentimiento";

/**
 * Solo existe si hay Google Analytics configurado — sin GA_MEASUREMENT_ID
 * el sitio no pone ninguna cookie que no sea la de sesión (estrictamente
 * necesaria, exenta de pedir consentimiento), así que el aviso ni se
 * monta. GA no se carga hasta que el usuario acepta explícitamente: nada
 * de "consentimiento implícito por seguir navegando".
 */
export function CookieConsent({ gaId }: { gaId: string }) {
  const [decision, setDecision] = React.useState<"pendiente" | "aceptado" | "rechazado">(
    "pendiente",
  );

  React.useEffect(() => {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (guardado === "aceptado" || guardado === "rechazado") setDecision(guardado);
  }, []);

  function decidir(valor: "aceptado" | "rechazado") {
    localStorage.setItem(STORAGE_KEY, valor);
    setDecision(valor);
  }

  return (
    <>
      {decision === "aceptado" && <GoogleAnalytics gaId={gaId} />}
      {decision === "pendiente" && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 p-4 backdrop-blur-md sm:p-5">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-center text-xs text-muted-foreground sm:text-left">
              Usamos cookies de analítica para entender cómo se usa la tienda y mejorarla. No
              afectan tu compra ni tus datos de pago.
            </p>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" onClick={() => decidir("rechazado")}>
                Rechazar
              </Button>
              <Button size="sm" onClick={() => decidir("aceptado")}>
                Aceptar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
