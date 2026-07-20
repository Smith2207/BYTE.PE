import Link from "next/link";

import { categoriasNav, footerLegalLinks, siteConfig } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/40 print:hidden">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-1">
          <span className="font-display text-xl font-semibold tracking-tight">
            {siteConfig.nombre}
          </span>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">{siteConfig.descripcion}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">Categorías</h3>
          <ul className="mt-4 space-y-2.5">
            {categoriasNav.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/productos?categoria=${c.slug}`}
                  className="text-sm text-muted-foreground transition hover:text-foreground"
                >
                  {c.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">Ayuda y legal</h3>
          <ul className="mt-4 space-y-2.5">
            {footerLegalLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-muted-foreground transition hover:text-foreground"
                >
                  {l.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">Contacto</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li>{siteConfig.email}</li>
            <li>WhatsApp: +{siteConfig.whatsapp}</li>
            <li>Lima, Perú</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {siteConfig.nombre}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
