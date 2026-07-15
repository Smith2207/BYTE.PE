"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { formatoPEN } from "@/lib/format";
import type { ProveedorCompra } from "@/lib/compras/store";
import type { CategoriaAlmacenada } from "@/lib/mock/repo";
import { crearCompraAction } from "./actions";

const SIN_PRODUCTO = "__nuevo__";

type ItemForm = {
  productoId: string;
  descripcion: string;
  cantidad: string;
  costoUnitario: string;
  // Solo para "producto nuevo": con esto se publica en el catálogo cuando
  // la compra se marca como recibida.
  categoriaId: string;
  marca: string;
  precioVenta: string;
  // Opcional — si TODOS los ítems lo traen, el envío/aduana se reparte por
  // peso en vez de en partes iguales por unidad.
  pesoKg: string;
};

function itemVacio(): ItemForm {
  return {
    productoId: SIN_PRODUCTO,
    descripcion: "",
    cantidad: "1",
    costoUnitario: "",
    categoriaId: "",
    marca: "",
    precioVenta: "",
    pesoKg: "",
  };
}

export function CompraForm({
  productos,
  categorias,
}: {
  productos: { id: string; nombre: string; sku: string }[];
  categorias: CategoriaAlmacenada[];
}) {
  const router = useRouter();
  const [guardando, setGuardando] = React.useState(false);
  const [proveedor, setProveedor] = React.useState<ProveedorCompra>("amazon");
  const [proveedorNombre, setProveedorNombre] = React.useState("");
  const [numeroOrdenExterno, setNumeroOrdenExterno] = React.useState("");
  const [fechaCompra, setFechaCompra] = React.useState(new Date().toISOString().slice(0, 10));
  const [costoEnvioImportacion, setCostoEnvioImportacion] = React.useState("0");
  const [otrosCostos, setOtrosCostos] = React.useState("0");
  const [pagoImpuestos, setPagoImpuestos] = React.useState(false);
  const [montoImpuestos, setMontoImpuestos] = React.useState("0");
  const [courierInternacional, setCourierInternacional] = React.useState("");
  const [trackingInternacional, setTrackingInternacional] = React.useState("");
  const [comprobanteUrl, setComprobanteUrl] = React.useState("");
  const [notas, setNotas] = React.useState("");
  const [items, setItems] = React.useState<ItemForm[]>([itemVacio()]);

  const subtotal = items.reduce(
    (acc, i) => acc + (Number(i.cantidad) || 0) * (Number(i.costoUnitario) || 0),
    0,
  );
  const total =
    subtotal +
    (Number(costoEnvioImportacion) || 0) +
    (Number(otrosCostos) || 0) +
    (pagoImpuestos ? Number(montoImpuestos) || 0 : 0);

  function actualizarItem(index: number, cambios: Partial<ItemForm>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...cambios } : it)));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const itemNuevoSinDatos = items.some(
      (i) => i.productoId === SIN_PRODUCTO && (!i.categoriaId || !i.precioVenta),
    );
    if (itemNuevoSinDatos) {
      toast.error(
        "A los productos nuevos les falta categoría o precio de venta (se necesitan para publicarlos cuando llegue la mercadería).",
      );
      return;
    }

    setGuardando(true);
    try {
      await crearCompraAction({
        proveedor,
        proveedorNombre: proveedor === "otro" ? proveedorNombre : undefined,
        numeroOrdenExterno: numeroOrdenExterno || undefined,
        fechaCompra: new Date(fechaCompra).toISOString(),
        items: items.map((i) => ({
          productoId: i.productoId === SIN_PRODUCTO ? null : i.productoId,
          descripcion: i.descripcion,
          cantidad: Number(i.cantidad),
          costoUnitario: Number(i.costoUnitario),
          categoriaId: i.productoId === SIN_PRODUCTO ? i.categoriaId : undefined,
          marca: i.productoId === SIN_PRODUCTO ? i.marca || undefined : undefined,
          precioVenta: i.productoId === SIN_PRODUCTO ? Number(i.precioVenta) : undefined,
          pesoKg: i.pesoKg ? Number(i.pesoKg) : undefined,
        })),
        costoEnvioImportacion: Number(costoEnvioImportacion) || 0,
        otrosCostos: Number(otrosCostos) || 0,
        pagoImpuestos,
        montoImpuestos: pagoImpuestos ? Number(montoImpuestos) || 0 : undefined,
        courierInternacional: courierInternacional || undefined,
        trackingInternacional: trackingInternacional || undefined,
        comprobanteUrl: comprobanteUrl || undefined,
        notas: notas || undefined,
      });
      toast.success("Compra registrada");
      router.push("/admin/compras");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo registrar la compra");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <div>
            <Label htmlFor="proveedor">Proveedor</Label>
            <Select value={proveedor} onValueChange={(v) => setProveedor(v as ProveedorCompra)}>
              <SelectTrigger id="proveedor" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amazon">Amazon</SelectItem>
                <SelectItem value="ebay">eBay</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {proveedor === "otro" && (
            <div>
              <Label htmlFor="proveedorNombre">Nombre del proveedor</Label>
              <Input
                id="proveedorNombre"
                className="mt-1.5"
                value={proveedorNombre}
                onChange={(e) => setProveedorNombre(e.target.value)}
              />
            </div>
          )}
          <div>
            <Label htmlFor="numeroOrden">N° de orden (opcional)</Label>
            <Input
              id="numeroOrden"
              className="mt-1.5"
              placeholder={
                proveedor === "ebay" ? "Ej: 12-03456-78901" : "Ej: 111-2233445-6677889"
              }
              value={numeroOrdenExterno}
              onChange={(e) => setNumeroOrdenExterno(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="fechaCompra">Fecha de compra</Label>
            <Input
              id="fechaCompra"
              type="date"
              className="mt-1.5"
              value={fechaCompra}
              onChange={(e) => setFechaCompra(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <p className="mb-1 text-sm font-semibold">Tramo internacional (USA → Perú)</p>
            <p className="text-xs text-muted-foreground">
              El forwarder que trae el paquete hasta Perú — distinto del courier que reparte al
              cliente final.
            </p>
          </div>
          <div>
            <Label htmlFor="courierInternacional">Courier / forwarder (opcional)</Label>
            <Input
              id="courierInternacional"
              className="mt-1.5"
              placeholder="Ej: MyUS, Aerobox, JetBox..."
              value={courierInternacional}
              onChange={(e) => setCourierInternacional(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="trackingInternacional">N° de tracking internacional (opcional)</Label>
            <Input
              id="trackingInternacional"
              className="mt-1.5"
              value={trackingInternacional}
              onChange={(e) => setTrackingInternacional(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Productos comprados</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setItems((prev) => [...prev, itemVacio()])}
            >
              <Plus className="size-4" /> Agregar producto
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, i) => {
              const esNuevo = item.productoId === SIN_PRODUCTO;
              return (
                <div key={i} className="space-y-2 rounded-xl border border-border/60 p-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Select
                      value={item.productoId}
                      onValueChange={(v) => {
                        const producto = productos.find((p) => p.id === v);
                        actualizarItem(i, {
                          productoId: v,
                          descripcion: producto ? producto.nombre : item.descripcion,
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Producto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SIN_PRODUCTO}>Producto nuevo / otro</SelectItem>
                        {productos.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.nombre} ({p.sku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Descripción"
                      required
                      value={item.descripcion}
                      onChange={(e) => actualizarItem(i, { descripcion: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      placeholder="Cantidad"
                      required
                      className="w-28"
                      value={item.cantidad}
                      onChange={(e) => actualizarItem(i, { cantidad: e.target.value })}
                    />
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Costo unitario (S/)"
                      required
                      className="w-40"
                      value={item.costoUnitario}
                      onChange={(e) => actualizarItem(i, { costoUnitario: e.target.value })}
                    />
                    <Input
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="Peso unitario (kg, opcional)"
                      className="w-48"
                      value={item.pesoKg}
                      onChange={(e) => actualizarItem(i, { pesoKg: e.target.value })}
                    />
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="ml-auto"
                        onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
                      >
                        <X className="size-4" />
                      </Button>
                    )}
                  </div>

                  {esNuevo && (
                    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-primary">
                        <Sparkles className="size-3.5" />
                        Producto nuevo — se publica solo cuando marques la compra como
                        &quot;recibido&quot;
                      </p>
                      <div className="grid gap-2 sm:grid-cols-3">
                        <Select
                          value={item.categoriaId}
                          onValueChange={(v) => actualizarItem(i, { categoriaId: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {categorias.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Marca (opcional)"
                          value={item.marca}
                          onChange={(e) => actualizarItem(i, { marca: e.target.value })}
                        />
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Precio de venta (S/)"
                          value={item.precioVenta}
                          onChange={(e) => actualizarItem(i, { precioVenta: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <div>
            <Label htmlFor="costoEnvio">Costo de envío/importación (S/)</Label>
            <Input
              id="costoEnvio"
              type="number"
              step="0.01"
              min="0"
              className="mt-1.5"
              value={costoEnvioImportacion}
              onChange={(e) => setCostoEnvioImportacion(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="otrosCostos">Otros costos (desaduanaje, comisiones...)</Label>
            <Input
              id="otrosCostos"
              type="number"
              step="0.01"
              min="0"
              className="mt-1.5"
              value={otrosCostos}
              onChange={(e) => setOtrosCostos(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2 flex items-center gap-2">
            <Checkbox
              id="pagoImpuestos"
              checked={pagoImpuestos}
              onCheckedChange={(v) => setPagoImpuestos(Boolean(v))}
            />
            <Label htmlFor="pagoImpuestos" className="font-normal">
              Esta importación pagó impuestos de aduana
            </Label>
          </div>
          {pagoImpuestos && (
            <div>
              <Label htmlFor="montoImpuestos">Monto de impuestos (S/)</Label>
              <Input
                id="montoImpuestos"
                type="number"
                step="0.01"
                min="0"
                className="mt-1.5"
                value={montoImpuestos}
                onChange={(e) => setMontoImpuestos(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Si todavía no lo sabes con exactitud, puedes actualizarlo después desde el
                detalle de la compra.
              </p>
            </div>
          )}
          <div className="sm:col-span-2">
            <Label htmlFor="comprobanteUrl">Enlace al comprobante/factura (opcional)</Label>
            <Input
              id="comprobanteUrl"
              className="mt-1.5"
              placeholder="https://..."
              value={comprobanteUrl}
              onChange={(e) => setComprobanteUrl(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="notas">Notas (opcional)</Label>
            <Textarea
              id="notas"
              className="mt-1.5"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2 space-y-1 rounded-xl border border-border/60 bg-secondary/40 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal productos</span>
              <span>{formatoPEN(subtotal)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Costo total de la compra</span>
              <span>{formatoPEN(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/compras")}>
          Cancelar
        </Button>
        <Button type="submit" disabled={guardando}>
          {guardando ? <Loader2 className="size-4 animate-spin" /> : "Registrar compra"}
        </Button>
      </div>
    </form>
  );
}
