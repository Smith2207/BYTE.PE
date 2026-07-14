import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { obtenerCompra, nombreProveedor } from "@/lib/compras/store";
import { formatoPEN } from "@/lib/format";
import { EstadoCompraSelector } from "../estado-selector";

export const metadata = { title: "Admin — Detalle de compra" };

export default async function DetalleCompraPage({ params }: { params: { id: string } }) {
  const compra = await obtenerCompra(params.id);
  if (!compra) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display mb-6 text-2xl font-bold">
        Compra — {nombreProveedor(compra)}
      </h1>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Estado</span>
            <EstadoCompraSelector id={compra.id} estado={compra.estado} />
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Fecha de compra</p>
              <p>{new Date(compra.fechaCompra).toLocaleDateString("es-PE")}</p>
            </div>
            {compra.fechaRecibido && (
              <div>
                <p className="text-muted-foreground">Fecha recibido</p>
                <p>{new Date(compra.fechaRecibido).toLocaleDateString("es-PE")}</p>
              </div>
            )}
            {compra.numeroOrdenExterno && (
              <div>
                <p className="text-muted-foreground">N° de orden</p>
                <p>{compra.numeroOrdenExterno}</p>
              </div>
            )}
            {compra.comprobanteUrl && (
              <div>
                <p className="text-muted-foreground">Comprobante</p>
                <Link
                  href={compra.comprobanteUrl}
                  target="_blank"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  Ver <ExternalLink className="size-3" />
                </Link>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <h2 className="text-sm font-semibold">Productos</h2>
            {compra.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.cantidad}x {item.descripcion}
                  {item.productoId ? (
                    <Link
                      href={`/admin/productos/${item.productoId}`}
                      className="ml-1.5 text-xs text-primary hover:underline"
                    >
                      (ver en catálogo)
                    </Link>
                  ) : (
                    <span className="ml-1.5 text-xs text-accent">
                      (se publica al marcar como recibido)
                    </span>
                  )}
                </span>
                <span>{formatoPEN(item.cantidad * item.costoUnitario)}</span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatoPEN(compra.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Envío/importación</span>
              <span>{formatoPEN(compra.costoEnvioImportacion)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Otros costos</span>
              <span>{formatoPEN(compra.otrosCostos)}</span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between text-base font-bold">
            <span>Costo total</span>
            <span>{formatoPEN(compra.costoTotal)}</span>
          </div>

          {compra.notas && (
            <>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground">Notas</p>
                <p className="text-sm">{compra.notas}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
