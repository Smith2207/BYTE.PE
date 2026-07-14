import { auth } from "@/auth";
import { listarWishlistPorUsuario } from "@/lib/wishlist/store";
import { getProductoPorId } from "@/lib/mock/repo";
import { ProductoCard } from "@/components/catalogo/producto-card";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";

export const metadata = { title: "Lista de deseos" };

export default async function CuentaWishlistPage() {
  const session = await auth();
  const items = session?.user?.id ? await listarWishlistPorUsuario(session.user.id) : [];
  const productos = (await Promise.all(items.map((i) => getProductoPorId(i.productoId)))).filter(
    (p): p is NonNullable<typeof p> => p !== null,
  );

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-bold">Lista de deseos</h1>
      {productos.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Todavía no guardaste productos. Toca el corazón en cualquier producto para agregarlo
          aquí.
        </p>
      ) : (
        <RevealOnScroll
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          selector="[data-wishlist-card]"
          stagger={0.06}
          y={20}
        >
          {productos.map((p) => (
            <div key={p.id} data-wishlist-card>
              <ProductoCard producto={p} />
            </div>
          ))}
        </RevealOnScroll>
      )}
    </div>
  );
}
