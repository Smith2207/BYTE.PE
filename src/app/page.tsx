import { Hero } from "@/components/home/hero";
import { CategoriasGrid } from "@/components/home/categorias-grid";
import { DestacadosSection } from "@/components/home/destacados-section";
import { ConfianzaBanner } from "@/components/home/confianza-banner";
import { getCategorias, getProductosDestacados } from "@/lib/mock/repo";

export default async function Home() {
  const categorias = await getCategorias();
  const destacados = await getProductosDestacados(8);

  return (
    <>
      <Hero />
      <ConfianzaBanner />
      <CategoriasGrid categorias={categorias} />
      <DestacadosSection productos={destacados} />
    </>
  );
}
