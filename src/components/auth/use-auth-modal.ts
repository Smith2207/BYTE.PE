"use client";

import { usePathname, useRouter } from "next/navigation";

/** Abre el modal de login/registro como overlay sobre la página actual —
 * nunca navega a una ruta separada. Se usa desde cualquier punto del sitio
 * que hoy mandaría a /login (navbar, wishlist, reseñas...). */
export function useAbrirAuthModal() {
  const router = useRouter();
  const pathname = usePathname();

  return function abrir(modo: "login" | "registro" = "login") {
    router.push(`${pathname}?auth=${modo}`);
  };
}
