import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

import { verificarEmailConToken } from "@/lib/usuarios/store";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";

export const metadata = { title: "Verificar correo" };

export default async function VerificarCorreoPage({ params }: { params: { token: string } }) {
  let ok = true;
  let error: string | null = null;
  try {
    await verificarEmailConToken(params.token);
  } catch (err) {
    ok = false;
    error = err instanceof Error ? err.message : "No se pudo verificar tu correo.";
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <RevealOnScroll y={24}>
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/60 py-10 text-center">
          {ok ? (
            <>
              <CheckCircle2 className="size-10 text-emerald-500" />
              <p className="max-w-xs text-sm text-muted-foreground">
                ¡Listo! Confirmamos tu correo.
              </p>
            </>
          ) : (
            <>
              <XCircle className="size-10 text-destructive" />
              <p className="max-w-xs text-sm text-muted-foreground">{error}</p>
            </>
          )}
          <Link href="/cuenta" className="text-sm font-medium text-primary hover:underline">
            Ir a mi cuenta
          </Link>
        </div>
      </RevealOnScroll>
    </div>
  );
}
