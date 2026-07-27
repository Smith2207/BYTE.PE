import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Página no encontrada" };

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24">
      <EmptyState
        icon={SearchX}
        titulo="Esta página no existe"
        descripcion="El enlace puede estar roto o el producto ya no está disponible. Volvé al catálogo para seguir viendo tecnología."
        cta={{ href: "/productos", label: "Ver catálogo" }}
      />
    </div>
  );
}
