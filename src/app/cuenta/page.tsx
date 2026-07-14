import { auth } from "@/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Mi cuenta" };

export default async function CuentaPage() {
  const session = await auth();

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-bold">Mi perfil</h1>
      <Card>
        <CardContent className="space-y-3 pt-6 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nombre</span>
            <span className="font-medium">{session?.user?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Correo</span>
            <span className="font-medium">{session?.user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rol</span>
            <Badge variant="outline" className="capitalize">
              {session?.user?.rol}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
