import { RegistroForm } from "./registro-form";

export const metadata = { title: "Crear cuenta" };

export default function RegistroPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="font-display mb-6 text-center text-2xl font-bold">Crear cuenta</h1>
      <RegistroForm />
    </div>
  );
}
