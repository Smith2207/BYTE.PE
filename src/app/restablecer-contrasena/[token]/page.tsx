import Link from "next/link";
import { XCircle } from "lucide-react";

import { tokenResetEsValido } from "@/lib/usuarios/store";
import { RestablecerContrasenaForm } from "./restablecer-form";

export const metadata = { title: "Restablecer contraseña" };

export default async function RestablecerContrasenaPage({
  params,
}: {
  params: { token: string };
}) {
  const valido = await tokenResetEsValido(params.token);

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="font-display mb-6 text-center text-2xl font-bold">Restablecer contraseña</h1>
      {valido ? (
        <RestablecerContrasenaForm token={params.token} />
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/60 py-10 text-center">
          <XCircle className="size-10 text-destructive" />
          <p className="max-w-xs text-sm text-muted-foreground">
            Este enlace de recuperación no es válido o ya expiró. Solicita uno nuevo.
          </p>
          <Link
            href="/olvide-contrasena"
            className="text-sm font-medium text-primary hover:underline"
          >
            Pedir un nuevo enlace
          </Link>
        </div>
      )}
    </div>
  );
}
