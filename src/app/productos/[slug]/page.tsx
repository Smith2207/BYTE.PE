import Link from "next/link";
import { notFound } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AtmosphereLayer } from "@/components/fx/cinematic-backdrop";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";
import { getProductoBySlug } from "@/lib/mock/repo";
import { auth } from "@/auth";
import { estaEnWishlist } from "@/lib/wishlist/store";
import { ResenasSection } from "./resenas-section";
import { ProductoHero } from "./producto-hero";
import { EspecificacionesCards } from "./especificaciones-cards";
import { RelacionadosCarousel } from "./relacionados-carousel";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const data = await getProductoBySlug(params.slug);
  if (!data) return {};
  const { producto } = data;
  return {
    title: producto.nombre,
    description: producto.descripcion,
    openGraph: {
      title: producto.nombre,
      description: producto.descripcion,
      images: producto.imagenes[0] ? [producto.imagenes[0]] : undefined,
    },
  };
}

export default async function ProductoPage({ params }: { params: { slug: string } }) {
  const data = await getProductoBySlug(params.slug);
  if (!data) notFound();

  const { producto, variantes, relacionados } = data;
  const session = await auth();
  const inicialEnWishlist = session?.user?.id
    ? await estaEnWishlist(session.user.id, producto.id)
    : false;

  return (
    <div className="relative">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <AtmosphereLayer
          glowPosition="50% 0%"
          intensity={0.4}
          showRays={false}
          showParticles={false}
          showVignette={false}
          blend={false}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Inicio</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/productos?categoria=${producto.categoria.slug}`}>
                  {producto.categoria.nombre}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{producto.nombre}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-6">
          <ProductoHero
            producto={producto}
            variantes={variantes}
            inicialEnWishlist={inicialEnWishlist}
          />
        </div>

        <EspecificacionesCards specs={producto.specsJson} />

        {relacionados.length > 0 && <RelacionadosCarousel productos={relacionados} />}

        <RevealOnScroll y={30}>
          <ResenasSection productoId={producto.id} productoSlug={producto.slug} />
        </RevealOnScroll>
      </div>
    </div>
  );
}
