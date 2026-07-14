import { adminListarProductos, adminListarCategorias } from "@/lib/mock/repo";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";
import { CompraForm } from "../compra-form";

export const metadata = { title: "Admin — Nueva compra" };

export default async function NuevaCompraPage() {
  const productos = (await adminListarProductos()).map((p) => ({ id: p.id, nombre: p.nombre, sku: p.sku }));
  const categorias = await adminListarCategorias();
  return (
    <RevealOnScroll y={16}>
      <h1 className="font-display mb-6 text-2xl font-bold">Nueva compra / importación</h1>
      <CompraForm productos={productos} categorias={categorias} />
    </RevealOnScroll>
  );
}
