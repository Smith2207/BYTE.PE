import Link from "next/link";
import { User, Package, MapPin, Heart } from "lucide-react";
import { ScrollCinematicBackdrop } from "@/components/fx/scroll-cinematic-backdrop";

const navItems = [
  { href: "/cuenta", label: "Mi perfil", icon: User },
  { href: "/cuenta/pedidos", label: "Mis pedidos", icon: Package },
  { href: "/cuenta/direcciones", label: "Direcciones", icon: MapPin },
  { href: "/cuenta/wishlist", label: "Lista de deseos", icon: Heart },
];

export default function CuentaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <ScrollCinematicBackdrop />
      <nav className="relative z-10 mb-6 flex gap-1 overflow-x-auto pb-1 md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium text-foreground/80 transition hover:bg-secondary hover:text-foreground"
          >
            <item.icon className="size-3.5" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="relative z-10 flex gap-8">
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition hover:bg-secondary hover:text-foreground"
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
