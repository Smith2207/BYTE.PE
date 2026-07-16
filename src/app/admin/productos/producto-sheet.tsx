"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Video, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ImagenUploader } from "@/components/admin/imagen-uploader";
import type { CategoriaAlmacenada, ProductoAlmacenado, ProductoFormInput } from "@/lib/mock/repo";
import { formatoPEN } from "@/lib/format";
import { crearProductoAction, actualizarProductoAction, generarVideoProductoAction } from "./actions";

export function ProductoSheet({
  categorias,
  producto,
  trigger,
  defaultOpen = false,
}: {
  categorias: CategoriaAlmacenada[];
  producto?: ProductoAlmacenado;
  trigger: React.ReactNode;
  /** Abre el sheet automáticamente (deep-link desde `?editar=<id>`). */
  defaultOpen?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(defaultOpen);
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

  const [videoEstado, setVideoEstado] = React.useState(producto?.videoEstado ?? "sin_generar");
  const [videoUrl, setVideoUrl] = React.useState(producto?.videoUrl ?? null);
  const [generandoVideo, setGenerandoVideo] = React.useState(false);

  // El render lo hace un servicio aparte (Railway) y avisa por webhook —
  // este componente no se entera solo, así que mientras esté "generando"
  // refresca la página server-side cada pocos segundos hasta ver el
  // resultado (o hasta que el admin cierre el sheet).
  React.useEffect(() => {
    setVideoEstado(producto?.videoEstado ?? "sin_generar");
    setVideoUrl(producto?.videoUrl ?? null);
  }, [producto?.videoEstado, producto?.videoUrl]);

  React.useEffect(() => {
    if (!open || videoEstado !== "generando") return;
    const intervalo = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(intervalo);
  }, [open, videoEstado, router]);

  async function onGenerarVideo() {
    if (!producto) return;
    setGenerandoVideo(true);
    try {
      await generarVideoProductoAction(producto.id);
      setVideoEstado("generando");
      toast.success("Generando video…", { description: "Puede tardar unos minutos, es experimental." });
      router.refresh();
    } catch (err) {
      setVideoEstado("error");
      toast.error(err instanceof Error ? err.message : "No se pudo iniciar el render");
    } finally {
      setGenerandoVideo(false);
    }
  }

  const margen = React.useMemo(() => {
    const precioVenta = Number(form.precioOferta || form.precio);
    const costo = Number(form.costoAdquisicion);
    if (!precioVenta || !costo) return null;
    const monto = precioVenta - costo;
    return { monto, porcentaje: Math.round((monto / precioVenta) * 100) };
  }, [form.precio, form.precioOferta, form.costoAdquisicion]);

  function onOpenChange(v: boolean) {
    setOpen(v);
    // Si se abrió por un deep-link (?editar=id), limpiar la URL al cerrar.
    if (!v && defaultOpen) router.replace("/admin/productos");
  }

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
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar el producto");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{producto ? "Editar producto" : "Nuevo producto"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <section className="space-y-4 rounded-xl border border-border/60 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Información general
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
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
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-border/60 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Precio y stock
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
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
              <div className="sm:col-span-2">
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
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
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
            </div>
          </section>

          <section className="space-y-3 rounded-xl border border-border/60 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Imágenes
            </h3>
            <ImagenUploader imagenes={imagenes} onChange={setImagenes} />
          </section>

          <section className="space-y-3 rounded-xl border border-border/60 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Ficha técnica
              </h3>
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
          </section>

          {producto && (
            <section className="space-y-3 rounded-xl border border-border/60 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Video de producto
                </h3>
                {videoEstado === "generando" && <Badge variant="secondary">Generando…</Badge>}
                {videoEstado === "listo" && <Badge className="bg-primary text-primary-foreground">Listo</Badge>}
                {videoEstado === "error" && <Badge variant="destructive">Error</Badge>}
              </div>

              {videoUrl && videoEstado === "listo" && (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video controls src={videoUrl} className="w-full rounded-lg bg-black" />
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={generandoVideo || videoEstado === "generando"}
                onClick={onGenerarVideo}
              >
                {generandoVideo || videoEstado === "generando" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Video className="size-4" />
                )}
                {videoEstado === "listo"
                  ? "Regenerar video"
                  : videoEstado === "error"
                    ? "Reintentar"
                    : videoEstado === "generando"
                      ? "Generando…"
                      : "Generar video"}
              </Button>

              {videoEstado === "error" && (
                <p className="text-xs text-destructive">
                  El último intento falló. Puedes reintentar.
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Video corto generado automáticamente a partir de las fotos y datos del producto
                (función experimental, puede tardar varios minutos o fallar).
              </p>
            </section>
          )}

          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando ? <Loader2 className="size-4 animate-spin" /> : "Guardar"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
