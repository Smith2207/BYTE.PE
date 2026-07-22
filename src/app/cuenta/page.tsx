import Link from "next/link";
import { Package, MapPin } from "lucide-react";

import { auth } from "@/auth";
import { Card, CardContent } from "@/components/ui/card";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";
import { GLASS_CARD } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { getUsuarioPorId } from "@/lib/usuarios/store";
import { listarPedidosPorUsuario } from "@/lib/pedidos/store";
import { listarDireccionesPorUsuario } from "@/lib/direcciones/store";
import { PerfilForm } from "./perfil-form";
import { AvatarUploader } from "./avatar-uploader";

export const metadata = { title: "Mi cuenta" };

function iniciales(nombre: string) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default async function CuentaPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [usuario, pedidos, direcciones] = await Promise.all([
    getUsuarioPorId(session.user.id),
    listarPedidosPorUsuario(session.user.id),
    listarDireccionesPorUsuario(session.user.id),
  ]);
  if (!usuario) return null;

  const miembroDesde = new Date(usuario.createdAt).toLocaleDateString("es-PE", {
    month: "long",
    year: "numeric",
  });

  return (
    <RevealOnScroll y={20} className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Mi perfil</h1>

      <Card className={GLASS_CARD}>
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center sm:flex-row sm:text-left">
          <AvatarUploader
            imagen={usuario.imagen}
            iniciales={iniciales(usuario.nombre)}
            nombre={usuario.nombre}
          />
          <div>
            <p className="text-lg font-semibold">{usuario.nombre}</p>
            <p className="text-sm text-muted-foreground">{usuario.email}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Miembro desde {miembroDesde}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/cuenta/pedidos">
          <Card className={cn(GLASS_CARD, "transition hover:border-primary/40")}>
            <CardContent className="flex items-center gap-3 pt-6">
              <Package className="size-5 text-primary" />
              <div>
                <p className="text-lg font-bold">{pedidos.length}</p>
                <p className="text-xs text-muted-foreground">Pedido(s) realizados</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/cuenta/direcciones">
          <Card className={cn(GLASS_CARD, "transition hover:border-primary/40")}>
            <CardContent className="flex items-center gap-3 pt-6">
              <MapPin className="size-5 text-primary" />
              <div>
                <p className="text-lg font-bold">{direcciones.length}</p>
                <p className="text-xs text-muted-foreground">Dirección(es) guardadas</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card className={GLASS_CARD}>
        <CardContent className="pt-6">
          <h2 className="mb-4 text-sm font-semibold">Datos personales</h2>
          <PerfilForm nombre={usuario.nombre} telefono={usuario.telefono} dni={usuario.dni} />
        </CardContent>
      </Card>
    </RevealOnScroll>
  );
}
