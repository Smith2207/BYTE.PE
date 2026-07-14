import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listarCompras, nombreProveedor } from "@/lib/compras/store";
import { formatoPEN } from "@/lib/format";
import { EstadoCompraSelector } from "./estado-selector";

export const metadata = { title: "Admin — Compras" };

export default async function AdminComprasPage() {
  const compras = await listarCompras();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Compras e importaciones</h1>
        <Button asChild>
          <Link href="/admin/compras/nueva">
            <Plus className="size-4" /> Nueva compra
          </Link>
        </Button>
      </div>

      {compras.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Todavía no registraste compras a proveedores.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proveedor</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Costo total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Detalle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {compras.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    {nombreProveedor(c)}
                    {c.numeroOrdenExterno && (
                      <p className="text-xs font-normal text-muted-foreground">
                        {c.numeroOrdenExterno}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(c.fechaCompra).toLocaleDateString("es-PE")}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.items.reduce((acc, i) => acc + i.cantidad, 0)} unid. ({c.items.length} línea/s)
                  </TableCell>
                  <TableCell className="font-semibold">{formatoPEN(c.costoTotal)}</TableCell>
                  <TableCell>
                    <EstadoCompraSelector id={c.id} estado={c.estado} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/compras/${c.id}`} className="text-sm text-primary hover:underline">
                      Ver
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
