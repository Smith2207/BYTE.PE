import { Hero } from "@/components/home/hero";
import { CategoriasGrid } from "@/components/home/categorias-grid";
import { DestacadosSection } from "@/components/home/destacados-section";
import { ConfianzaBanner } from "@/components/home/confianza-banner";
import { ValueProps } from "@/components/home/value-props";
import { CuponBanner } from "@/components/home/cupon-banner";
import { Testimonios } from "@/components/home/testimonios";
import { CtaFinal } from "@/components/home/cta-final";
import { getCategorias, getProductosDestacados } from "@/lib/mock/repo";
import { getProductoIdsMasVendidos } from "@/lib/pedidos/store";

export default async function Home() {
  const [categorias, destacados, masVendidoIds] = await Promise.all([
    getCategorias(),
    getProductosDestacados(8),
    getProductoIdsMasVendidos(2),
  ]);

  return (
    <>
      <Hero />
      <ConfianzaBanner />
      <CategoriasGrid categorias={categorias} />
      <DestacadosSection productos={destacados} masVendidoIds={masVendidoIds} />
      <ValueProps />
      <CuponBanner />
      <Testimonios />
      <CtaFinal />
    </>
  );
}
