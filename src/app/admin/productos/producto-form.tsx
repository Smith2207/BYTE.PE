"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ImagenUploader } from "@/components/admin/imagen-uploader";
import type { CategoriaAlmacenada, ProductoAlmacenado, ProductoFormInput } from "@/lib/mock/repo";
import { formatoPEN } from "@/lib/format";
import { crearProductoAction, actualizarProductoAction } from "./actions";

export function ProductoForm({
  categorias,
  producto,
}: {
  categorias: CategoriaAlmacenada[];
  producto?: ProductoAlmacenado;
}) {
  const router = useRouter();
  const [guardando, setGuardando] = React.useState(false);
  const [specs, setSpecs] = React.useState<[string, string][]>(
    producto ? Object.entries(producto.specsJson) : [["", ""]],
  );

  const [form, setForm] = React.useState({
    nombre: producto?.nombre ?? "",
    descripcion: producto?.descripcion ?? "",
    precio: producto?.precio?.toString() ?? "",
    precioOferta: producto?.precioOferta?.toString() ?? "",
    costoAdquisicion: producto?.costoAdquisicion?.toString() ?? "",
    stock: producto?.stock?.toString() ?? "0",
    sku: producto?.sku ?? "",
    marca: producto?.marca ?? "",
    categoriaId: producto?.categoriaId ?? categorias[0]?.id ?? "",
    garantiaMeses: producto?.garantiaMeses?.toString() ?? "12",
    destacado: producto?.destacado ?? false,
  });
  const [imagenes, setImagenes] = React.useState<string[]>(producto?.imagenes ?? []);

  const margen = React.useMemo(() => {
    const precioVenta = Number(form.precioOferta || form.precio);
    const costo = Number(form.costoAdquisicion);
    if (!precioVenta || !costo) return null;
    const monto = precioVenta - costo;
    return { monto, porcentaje: Math.round((monto / precioVenta) * 100) };
  }, [form.precio, form.precioOferta, form.costoAdquisicion]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    try {
      const specsJson = Object.fromEntries(specs.filter(([k]) => k.trim() !== ""));
      const input: ProductoFormInput = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: Number(form.precio),
        precioOferta: form.precioOferta ? Number(form.precioOferta) : null,
        costoAdquisicion: form.costoAdquisicion ? Number(form.costoAdquisicion) : null,
        stock: Number(form.stock),
        sku: form.sku,
        marca: form.marca,
        categoriaId: form.categoriaId,
        pesoKg: null,
        imagenes,
        specsJson,
        garantiaMeses: Number(form.garantiaMeses),
        destacado: form.destacado,
      };

      if (producto) {
        await actualizarProductoAction(producto.id, input);
        toast.success("Producto actualizado");
      } else {
        await crearProductoAction(input);
        toast.success("Producto creado");
      }
      router.push("/admin/productos");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar el producto");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              className="mt-1.5"
              required
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              className="mt-1.5"
              rows={3}
              value={form.descripcion}
              onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="marca">Marca</Label>
            <Input
              id="marca"
              className="mt-1.5"
              required
              value={form.marca}
              onChange={(e) => setForm((f) => ({ ...f, marca: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              className="mt-1.5"
              required
              value={form.sku}
              onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="categoria">Categoría</Label>
            <Select
              value={form.categoriaId}
              onValueChange={(v) => setForm((f) => ({ ...f, categoriaId: v }))}
            >
              <SelectTrigger id="categoria" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="garantia">Garantía (meses)</Label>
            <Input
              id="garantia"
              type="number"
              min="0"
              className="mt-1.5"
              value={form.garantiaMeses}
              onChange={(e) => setForm((f) => ({ ...f, garantiaMeses: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="precio">Precio (S/)</Label>
            <Input
              id="precio"
              type="number"
              step="0.01"
              min="0"
              required
              className="mt-1.5"
              value={form.precio}
              onChange={(e) => setForm((f) => ({ ...f, precio: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="precioOferta">Precio de oferta (opcional)</Label>
            <Input
              id="precioOferta"
              type="number"
              step="0.01"
              min="0"
              className="mt-1.5"
              value={form.precioOferta}
              onChange={(e) => setForm((f) => ({ ...f, precioOferta: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="costoAdquisicion">Costo de compra/importación (S/)</Label>
            <Input
              id="costoAdquisicion"
              type="number"
              step="0.01"
              min="0"
              className="mt-1.5"
              placeholder="Lo que te costó a ti (Amazon, etc.)"
              value={form.costoAdquisicion}
              onChange={(e) => setForm((f) => ({ ...f, costoAdquisicion: e.target.value }))}
            />
            {margen && (
              <p className="mt-1 text-xs text-muted-foreground">
                Margen: {formatoPEN(margen.monto)} ({margen.porcentaje}%)
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Solo lo ve el admin, nunca se muestra en la tienda.
            </p>
          </div>
          <div>
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              required
              className="mt-1.5"
              value={form.stock}
              onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <Checkbox
              id="destacado"
              checked={form.destacado}
              onCheckedChange={(v) => setForm((f) => ({ ...f, destacado: Boolean(v) }))}
            />
            <Label htmlFor="destacado" className="font-normal">
              Mostrar en destacados de la home
            </Label>
          </div>
          <div className="sm:col-span-2">
            <Label>Imágenes</Label>
            <div className="mt-1.5">
              <ImagenUploader imagenes={imagenes} onChange={setImagenes} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Ficha técnica</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSpecs((s) => [...s, ["", ""]])}
            >
              <Plus className="size-4" /> Agregar campo
            </Button>
          </div>
          <div className="space-y-2">
            {specs.map(([clave, valor], i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="Ej: procesador"
                  value={clave}
                  onChange={(e) =>
                    setSpecs((s) => s.map((item, idx) => (idx === i ? [e.target.value, item[1]] : item)))
                  }
                />
                <Input
                  placeholder="Ej: Intel Core i7"
                  value={valor}
                  onChange={(e) =>
                    setSpecs((s) => s.map((item, idx) => (idx === i ? [item[0], e.target.value] : item)))
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setSpecs((s) => s.filter((_, idx) => idx !== i))}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/productos")}>
          Cancelar
        </Button>
        <Button type="submit" disabled={guardando}>
          {guardando ? <Loader2 className="size-4 animate-spin" /> : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
