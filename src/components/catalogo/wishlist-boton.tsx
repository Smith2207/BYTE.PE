"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { alternarWishlistAction } from "@/lib/wishlist/actions";

export function WishlistBoton({
  productoId,
  inicialEnWishlist = false,
  className,
}: {
  productoId: string;
  inicialEnWishlist?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const { status } = useSession();
  const [activo, setActivo] = React.useState(inicialEnWishlist);
  const [cargando, setCargando] = React.useState(false);

  async function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (status !== "authenticated") {
      toast.error("Inicia sesión para guardar en tu lista de deseos");
      router.push("/login");
      return;
    }

    setCargando(true);
    const previo = activo;
    setActivo(!previo);
    try {
      const { agregado } = await alternarWishlistAction(productoId);
      setActivo(agregado);
      toast.success(agregado ? "Agregado a tu lista de deseos" : "Quitado de tu lista de deseos");
    } catch {
      setActivo(previo);
      toast.error("No se pudo actualizar tu lista de deseos");
    } finally {
      setCargando(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={cargando}
      aria-label={activo ? "Quitar de favoritos" : "Agregar a favoritos"}
      className={cn(
        "flex size-8 items-center justify-center rounded-full bg-background-70 backdrop-blur transition",
        activo ? "text-accent" : "text-foreground/80 hover:text-accent",
        className,
      )}
    >
      <Heart className={cn("size-4", activo && "fill-current")} />
    </button>
  );
}
