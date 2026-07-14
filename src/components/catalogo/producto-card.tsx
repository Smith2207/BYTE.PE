import { ProductoLink } from "@/components/catalogo/producto-link";
import { SpotlightCard } from "@/components/fx/spotlight-card";
import { ProductoMedia } from "@/components/catalogo/producto-media";
import { WishlistBoton } from "@/components/catalogo/wishlist-boton";
import { Badge } from "@/components/ui/badge";
import type { ProductoCatalogo } from "@/lib/mock/repo";
import { formatoPEN } from "@/lib/format";

export function ProductoCard({ producto }: { producto: ProductoCatalogo }) {
  return (
    <SpotlightCard className="flex h-full flex-col transition-transform duration-300 hover:-translate-y-1">
      <ProductoLink href={`/productos/${producto.slug}`} className="flex h-full flex-col">
        <div className="relative">
          <ProductoMedia
            categoriaSlug={producto.categoria.slug}
            imagenUrl={producto.imagenes[0]}
            alt={producto.nombre}
            className="aspect-square w-full"
          />
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {producto.descuentoPorcentaje > 0 && (
              <Badge className="bg-accent text-accent-foreground">
                -{producto.descuentoPorcentaje}%
              </Badge>
            )}
            {!producto.disponible && <Badge variant="secondary">Agotado</Badge>}
          </div>
          <WishlistBoton productoId={producto.id} className="absolute right-3 top-3" />
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-4">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {producto.marca}
          </span>
          <h3 className="line-clamp-2 text-sm font-semibold text-foreground">{producto.nombre}</h3>

          <div className="mt-auto flex items-baseline gap-2 pt-2">
            <span className="font-display text-lg font-bold text-foreground">
              {formatoPEN(producto.precioFinal)}
            </span>
            {producto.precioOferta && (
              <span className="text-xs text-muted-foreground line-through">
                {formatoPEN(producto.precio)}
              </span>
            )}
          </div>
          {producto.disponible && producto.stock <= 5 && (
            <span className="text-xs font-medium text-accent">
              ¡Últimas {producto.stock} unidades!
            </span>
          )}
        </div>
      </ProductoLink>
    </SpotlightCard>
  );
}
