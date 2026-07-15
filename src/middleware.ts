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
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (esAdmin && req.auth?.user.rol !== "admin") {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/cuenta/:path*", "/admin/:path*", "/checkout/:path*"],
};
