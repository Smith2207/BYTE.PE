import { AdminSidebarNav, AdminSidebarNavMobile } from "@/components/admin/admin-sidebar-nav";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { AdminCommandPalette } from "@/components/admin/admin-command-palette";
import { contarAlertasStock } from "@/lib/mock/repo";
import { contarPedidosPendientes } from "@/lib/pedidos/store";
import { contarReclamosPendientes } from "@/lib/reclamos/store";
import { contarSolicitudesPendientes } from "@/lib/devoluciones/store";

/**
 * Consola de operaciones: layout fijo tipo app — sidebar y topbar no se
 * mueven, solo el área de trabajo (`<main>`) scrollea. Distinto del resto
 * del sitio (tienda pública/cuenta), que sí scrollea la página completa —
 * acá se prioriza tener siempre a mano la navegación y los contadores de
 * alertas mientras se revisan tablas largas.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [pedidosPendientes, alertasStock, reclamosPendientes, devolucionesPendientes] =
    await Promise.all([
      contarPedidosPendientes(),
      contarAlertasStock(),
      contarReclamosPendientes(),
      contarSolicitudesPendientes(),
    ]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminCommandPalette />

      <aside className="hidden w-56 shrink-0 flex-col overflow-y-auto border-r border-border/60 bg-card/40 px-4 py-6 md:flex">
        <p className="font-display mb-4 px-2 text-sm font-bold text-muted-foreground">
          Panel admin
        </p>
        <AdminSidebarNav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="shrink-0 border-b border-border/60 bg-card/60 px-4 py-3 backdrop-blur-md sm:px-6">
          <AdminSidebarNavMobile />
          <AdminTopbar
            pedidosPendientes={pedidosPendientes}
            alertasStock={alertasStock}
            reclamosPendientes={reclamosPendientes}
            devolucionesPendientes={devolucionesPendientes}
          />
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
