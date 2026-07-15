import { ProductoLink } from "@/components/catalogo/producto-link";
import { SpotlightCard } from "@/components/fx/spotlight-card";
import { TextScramble } from "@/components/fx/text-scramble";
import { ProductoMedia } from "@/components/catalogo/producto-media";
import { WishlistBoton } from "@/components/catalogo/wishlist-boton";
import { AgregarCarritoRapido } from "@/components/catalogo/agregar-carrito-rapido";
import { Badge } from "@/components/ui/badge";
import type { ProductoCatalogo } from "@/lib/mock/repo";
import { formatoPEN } from "@/lib/format";

export function ProductoCard({
  producto,
  etiqueta,
}: {
  producto: ProductoCatalogo;
  /** Insignia real (no decorativa): "nuevo" viene de createdAt, "mas-vendido" de unidades vendidas de verdad. */
  etiqueta?: "nuevo" | "mas-vendido";
}) {
  return (
    <SpotlightCard className="flex h-full flex-col">
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
            {etiqueta === "mas-vendido" && (
              <Badge className="bg-primary text-primary-foreground">Más vendido</Badge>
            )}
            {etiqueta === "nuevo" && <Badge variant="outline">Nuevo</Badge>}
            {!producto.disponible && <Badge variant="secondary">Agotado</Badge>}
          </div>
          <WishlistBoton productoId={producto.id} className="absolute right-3 top-3" />
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-4">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {producto.marca}
          </span>
          <h3 className="line-clamp-2 text-sm font-semibold text-foreground">{producto.nombre}</h3>

          <div className="mt-auto flex items-center gap-2 pt-2">
            <div className="flex flex-1 items-baseline gap-2">
              <TextScramble
                value={formatoPEN(producto.precioFinal)}
                className="text-lg font-bold text-foreground"
              />
              {producto.precioOferta && (
                <span className="font-mono text-xs text-muted-foreground line-through">
                  {formatoPEN(producto.precio)}
                </span>
              )}
            </div>
            {producto.disponible && !producto.tieneVariantes && (
              <AgregarCarritoRapido producto={producto} />
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
