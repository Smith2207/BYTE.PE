import { adminListarCategorias } from "@/lib/mock/repo";
import { ProductoForm } from "../producto-form";

export const metadata = { title: "Admin — Nuevo producto" };

export default async function NuevoProductoPage() {
  const categorias = await adminListarCategorias();
  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-bold">Nuevo producto</h1>
      <ProductoForm categorias={categorias} />
    </div>
  );
}
