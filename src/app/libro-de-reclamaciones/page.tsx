import { ReclamoForm } from "./reclamo-form";

export const metadata = { title: "Libro de Reclamaciones" };

export default function LibroReclamacionesPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Libro de Reclamaciones</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Conforme al Código de Protección y Defensa del Consumidor, este establecimiento cuenta con
        un Libro de Reclamaciones a tu disposición. La formulación de un reclamo no impide acudir
        a otras vías de solución de controversias ni es requisito previo para interponer una
        denuncia ante INDECOPI.
      </p>
      <div className="mt-10">
        <ReclamoForm />
      </div>
    </div>
  );
}
