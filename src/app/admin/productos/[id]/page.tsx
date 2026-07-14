import { notFound } from "next/navigation";
import { adminListarCategorias, adminObtenerProducto } from "@/lib/mock/repo";
import { ProductoForm } from "../producto-form";

export const metadata = { title: "Admin — Editar producto" };

export default async function EditarProductoPage({ params }: { params: { id: string } }) {
  const producto = await adminObtenerProducto(params.id);
  if (!producto) notFound();
  const categorias = await adminListarCategorias();

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-bold">Editar producto</h1>
      <ProductoForm categorias={categorias} producto={producto} />
    </div>
  );
}
