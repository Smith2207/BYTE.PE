import { auth } from "@/auth";
import { getUsuarioPorId } from "@/lib/usuarios/store";
import { listarDireccionesPorUsuario } from "@/lib/direcciones/store";
import { CheckoutWizard } from "./checkout-wizard";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  // El middleware ya exige sesión para /checkout — acá solo se asume que
  // existe (session.user.id siempre presente en este punto).
  const session = await auth();
  const [usuario, direcciones] = await Promise.all([
    getUsuarioPorId(session!.user.id),
    listarDireccionesPorUsuario(session!.user.id),
  ]);
  const direccionPrincipal = direcciones.find((d) => d.esPrincipal) ?? direcciones[0] ?? null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display mb-8 text-2xl font-bold sm:text-3xl">Finalizar compra</h1>
      <CheckoutWizard usuario={usuario} direccionPrincipal={direccionPrincipal} />
    </div>
  );
}
