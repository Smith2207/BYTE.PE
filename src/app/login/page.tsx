import { redirect } from "next/navigation";

/** Login ahora es un modal sobre la página actual (ver AuthModal), no una
 * página propia. Esta ruta se conserva solo como redirect de compatibilidad
 * para enlaces/bookmarks viejos y para next-auth (`auth.config.ts` →
 * `pages.signIn`), que necesita una URL real a la que apuntar. */
export default function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  const { callbackUrl } = searchParams;
  redirect(`/?auth=login${callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`);
}
