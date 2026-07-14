import { adminListarCategorias } from "@/lib/mock/repo";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";
import { Magnetic } from "@/components/fx/magnetic";
import { CategoriaDialog } from "./categoria-dialog";
import { EliminarCategoriaBoton } from "./eliminar-boton";

export const metadata = { title: "Admin — Categorías" };

export default async function AdminCategoriasPage() {
  const categorias = await adminListarCategorias();
  const padres = categorias.filter((c) => !c.categoriaPadreId);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Categorías</h1>
        <Magnetic strength={0.15} className="inline-block">
          <CategoriaDialog categoriasPadre={padres} />
        </Magnetic>
      </div>

      <RevealOnScroll y={16} className="overflow-hidden rounded-2xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Categoría padre</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categorias.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.nombre}</TableCell>
                <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                <TableCell className="text-muted-foreground">
                  {categorias.find((p) => p.id === c.categoriaPadreId)?.nombre ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <CategoriaDialog categoriasPadre={padres} categoria={c} />
                    <EliminarCategoriaBoton id={c.id} nombre={c.nombre} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </RevealOnScroll>
    </div>
  );
}
