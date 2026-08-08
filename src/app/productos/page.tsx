import { FiltrosSidebar } from "@/components/catalogo/filtros-sidebar";
import { FiltrosMobile } from "@/components/catalogo/filtros-mobile";
import { OrdenSelect } from "@/components/catalogo/orden-select";
import { ProductoCard } from "@/components/catalogo/producto-card";
import { ProductosPaginacion } from "@/components/catalogo/productos-paginacion";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";
import { EmptyState } from "@/components/ui/empty-state";
import { PackageSearch } from "lucide-react";
import { ELASTIC_EASE, STAGGER_MAX } from "@/lib/motion";
import { getCategorias, getMarcas, getProductos, type FiltrosProductos } from "@/lib/mock/repo";
import { siteConfig } from "@/lib/site-config";

export const metadata = { title: "Catálogo de productos" };

function parseNumero(valor?: string) {
  const n = Number(valor);
  return Number.isFinite(n) && valor ? n : undefined;
}

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const filtros: FiltrosProductos = {
    categoriaSlug: searchParams.categoria,
    marcas: searchParams.marca?.split(",").filter(Boolean),
    precioMin: parseNumero(searchParams.precioMin),
    precioMax: parseNumero(searchParams.precioMax),
    orden: (searchParams.orden as FiltrosProductos["orden"]) ?? "relevancia",
    busqueda: searchParams.q,
    page: parseNumero(searchParams.page) ?? 1,
  };

  const [{ items, total, page, pageSize }, categorias, marcas] = await Promise.all([
    getProductos(filtros),
    getCategorias(),
    getMarcas(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function buildHref(nuevaPagina: number) {
    const params = new URLSearchParams();
    if (filtros.categoriaSlug) params.set("categoria", filtros.categoriaSlug);
    if (filtros.marcas?.length) params.set("marca", filtros.marcas.join(","));
    if (filtros.precioMin != null) params.set("precioMin", String(filtros.precioMin));
    if (filtros.precioMax != null) params.set("precioMax", String(filtros.precioMax));
    if (filtros.orden && filtros.orden !== "relevancia") params.set("orden", filtros.orden);
    params.set("page", String(nuevaPagina));
    return `/productos?${params.toString()}`;
  }

  const categoriaActual = filtros.categoriaSlug
    ? [...categorias, ...categorias.flatMap((c) => c.subcategorias)].find(
        (c) => c.slug === filtros.categoriaSlug,
      )
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">
          {categoriaActual?.nombre ?? "Todos los productos"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total} productos encontrados
          {siteConfig.envioGratis && " · Envío gratis en todo el catálogo"}
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="hidden lg:block">
          <FiltrosSidebar categorias={categorias} marcas={marcas} />
        </div>

        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between gap-3">
            <FiltrosMobile categorias={categorias} marcas={marcas} />
            <div className="ml-auto">
              <OrdenSelect />
            </div>
          </div>

          {items.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              titulo="No encontramos productos con estos filtros"
              descripcion="Prueba quitando algún filtro, cambiando el rango de precio o revisa que la palabra buscada esté bien escrita."
              cta={{ href: "/productos", label: "Limpiar filtros" }}
            />
          ) : (
            <RevealOnScroll
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4"
              selector="[data-producto-card]"
              stagger={STAGGER_MAX}
              ease={ELASTIC_EASE}
              y={20}
            >
              {items.map((p, i) => (
                <div key={p.id} data-producto-card>
                  <ProductoCard producto={p} priority={i < 4} />
                </div>
              ))}
            </RevealOnScroll>
          )}

          <div className="mt-10 flex justify-center">
            <ProductosPaginacion page={page} totalPages={totalPages} buildHref={buildHref} />
          </div>
        </div>
      </div>
    </div>
  );
}
