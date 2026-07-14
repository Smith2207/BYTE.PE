import Link from "next/link";
import { Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminListarProductos } from "@/lib/mock/repo";
import { formatoPEN } from "@/lib/format";
import { EliminarProductoBoton } from "./eliminar-boton";

export const metadata = { title: "Admin — Productos" };

export default async function AdminProductosPage() {
  const productos = await adminListarProductos();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Productos</h1>
        <Button asChild>
          <Link href="/admin/productos/nuevo">
            <Plus className="size-4" /> Nuevo producto
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productos.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">
                  {p.nombre}
                  <p className="text-xs font-normal text-muted-foreground">{p.sku}</p>
                </TableCell>
                <TableCell className="text-muted-foreground">{p.categoriaNombre}</TableCell>
                <TableCell>{formatoPEN(p.precioOferta ?? p.precio)}</TableCell>
                <TableCell>
                  <Badge variant={p.stock === 0 ? "destructive" : p.stock <= 5 ? "secondary" : "outline"}>
                    {p.stock}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={p.activo ? "outline" : "secondary"}>
                    {p.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/productos/${p.id}`}>
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                    <EliminarProductoBoton id={p.id} nombre={p.nombre} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
