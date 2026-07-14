import { auth } from "@/auth";
import { listarDireccionesPorUsuario } from "@/lib/direcciones/store";
import { DireccionesLista } from "./direcciones-lista";

export const metadata = { title: "Mis direcciones" };

export default async function CuentaDireccionesPage() {
  const session = await auth();
  const direcciones = session?.user?.id ? await listarDireccionesPorUsuario(session.user.id) : [];

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-bold">Mis direcciones</h1>
      <DireccionesLista direcciones={direcciones} />
    </div>
  );
}
