import { ShieldCheck } from "lucide-react";
import { AdminSidebarNav, AdminSidebarNavMobile } from "@/components/admin/admin-sidebar-nav";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { AdminCommandPalette } from "@/components/admin/admin-command-palette";
import { contarAlertasStock } from "@/lib/mock/repo";
import { contarPedidosPendientes } from "@/lib/pedidos/store";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [pedidosPendientes, alertasStock] = await Promise.all([
    contarPedidosPendientes(),
    contarAlertasStock(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs text-foreground/70">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
        <span>Acceso restringido al rol &quot;admin&quot; (protegido por middleware).</span>
      </div>

      <AdminCommandPalette />
      <AdminSidebarNavMobile />

      <div className="flex gap-8">
        <aside className="hidden w-56 shrink-0 md:block">
          <p className="font-display mb-4 px-2 text-sm font-bold text-muted-foreground">
            Panel admin
          </p>
          <AdminSidebarNav />
        </aside>

        <div className="min-w-0 flex-1">
          <AdminTopbar pedidosPendientes={pedidosPendientes} alertasStock={alertasStock} />
          {children}
        </div>
      </div>
    </div>
  );
}
