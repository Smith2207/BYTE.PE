import { adminListarProductos, adminListarCategorias } from "@/lib/mock/repo";
import { CompraForm } from "../compra-form";

export const metadata = { title: "Admin — Nueva compra" };

export default async function NuevaCompraPage() {
  const productos = (await adminListarProductos()).map((p) => ({ id: p.id, nombre: p.nombre, sku: p.sku }));
  const categorias = await adminListarCategorias();
  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-bold">Nueva compra / importación</h1>
      <CompraForm productos={productos} categorias={categorias} />
    </div>
  );
}
