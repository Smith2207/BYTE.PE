import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const esAdmin = pathname.startsWith("/admin");
  const esCuenta = pathname.startsWith("/cuenta");
  const esCheckout = pathname.startsWith("/checkout");

  if (!req.auth && (esAdmin || esCuenta || esCheckout)) {
    // Login es un modal (ver AuthModal), no una página propia — se abre
    // sobre el home con el destino original en callbackUrl para volver
    // ahí apenas inicie sesión.
    const homeConModal = new URL("/", req.nextUrl.origin);
    homeConModal.searchParams.set("auth", "login");
    homeConModal.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(homeConModal);
  }

  if (esAdmin && req.auth?.user.rol !== "admin") {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  // Un admin nunca debe terminar viendo la vista de cliente (/cuenta) —
  // sea que haya entrado ahí por el destino por defecto del login, un
  // link viejo o escribiendo la URL a mano. Siempre va directo al panel.
  if (esCuenta && req.auth?.user.rol === "admin") {
    return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/cuenta/:path*", "/admin/:path*", "/checkout/:path*"],
};
