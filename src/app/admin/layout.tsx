import Link from "next/link";
import { ShieldCheck, LayoutDashboard, Package, Tag, Tags, Receipt, Truck } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/categorias", label: "Categorías", icon: Tags },
  { href: "/admin/compras", label: "Compras", icon: Truck },
  { href: "/admin/cupones", label: "Cupones", icon: Tag },
  { href: "/admin/pedidos", label: "Pedidos", icon: Receipt },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs text-foreground/70">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
        <span>Acceso restringido al rol &quot;admin&quot; (protegido por middleware).</span>
      </div>

      <nav className="mb-6 flex gap-1 overflow-x-auto pb-1 md:hidden">
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

      <div className="flex gap-8">
        <aside className="hidden w-56 shrink-0 md:block">
          <p className="font-display mb-4 px-2 text-sm font-bold text-muted-foreground">
            Panel admin
          </p>
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
