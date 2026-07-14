import Link from "next/link";
import { PackageSearch, Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";
import { Magnetic } from "@/components/fx/magnetic";
import { adminListarCategorias, adminListarProductos } from "@/lib/mock/repo";
import { formatoPEN } from "@/lib/format";
import { EliminarProductoBoton } from "./eliminar-boton";
import { ProductoSheet } from "./producto-sheet";

export const metadata = { title: "Admin — Productos" };

export default async function AdminProductosPage({
  searchParams,
}: {
  searchParams: { q?: string; editar?: string };
}) {
  const [todos, categorias] = await Promise.all([adminListarProductos(), adminListarCategorias()]);
  const q = searchParams.q?.trim().toLowerCase();
  const productos = q
    ? todos.filter((p) => p.nombre.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
    : todos;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Productos</h1>
          {q && (
            <p className="mt-1 text-sm text-muted-foreground">
              {productos.length} resultado(s) para &quot;{q}&quot;
            </p>
          )}
        </div>
        <Magnetic strength={0.15} className="inline-block">
          <ProductoSheet
            categorias={categorias}
            trigger={
              <Button>
                <Plus className="size-4" /> Nuevo producto
              </Button>
            }
          />
        </Magnetic>
      </div>

      {productos.length === 0 ? (
        <RevealOnScroll className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-20 text-center">
          <PackageSearch className="size-10 text-muted-foreground" />
          <p className="mt-4 text-sm font-semibold">Sin resultados para &quot;{q}&quot;</p>
          <p className="mt-1 text-sm text-muted-foreground">Prueba con otro nombre o SKU.</p>
          <Link href="/admin/productos" className="mt-4 text-sm text-primary hover:underline">
            Ver todos los productos
          </Link>
        </RevealOnScroll>
      ) : (
      <RevealOnScroll y={16} className="overflow-hidden rounded-2xl border border-border/60">
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
                    <ProductoSheet
                      categorias={categorias}
                      producto={p}
                      defaultOpen={searchParams.editar === p.id}
                      trigger={
                        <Button variant="ghost" size="icon" aria-label="Editar producto">
                          <Pencil className="size-4" />
                        </Button>
                      }
                    />
                    <EliminarProductoBoton id={p.id} nombre={p.nombre} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </RevealOnScroll>
      )}
    </div>
  );
}
