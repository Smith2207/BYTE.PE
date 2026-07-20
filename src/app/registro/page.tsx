import { redirect } from "next/navigation";

/** Registro ahora es un modal sobre la página actual (ver AuthModal), no
 * una página propia. Se conserva como redirect de compatibilidad para
 * enlaces/bookmarks viejos. */
export default function RegistroPage() {
  redirect("/?auth=registro");
}
