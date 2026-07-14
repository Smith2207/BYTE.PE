import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";
import { OlvideContrasenaForm } from "./olvide-contrasena-form";

export const metadata = { title: "Recuperar contraseña" };

export default function OlvideContrasenaPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <RevealOnScroll y={24}>
        <h1 className="font-display mb-2 text-center text-2xl font-bold">Recuperar contraseña</h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Ingresa tu correo y te enviamos un enlace para crear una contraseña nueva.
        </p>
        <OlvideContrasenaForm />
      </RevealOnScroll>
    </div>
  );
}
