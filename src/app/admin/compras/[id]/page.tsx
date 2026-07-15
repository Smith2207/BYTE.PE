import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";
import { Badge } from "@/components/ui/badge";
import { obtenerCompra, nombreProveedor } from "@/lib/compras/store";
import { formatoPEN } from "@/lib/format";
import { trackingDisponible } from "@/lib/tracking";
import { EstadoCompraSelector } from "../estado-selector";
import { ImpuestosEditor } from "./impuestos-editor";
import { TIPO_ENVIO_ETIQUETA } from "../compras-filtros";
import { ActualizarTrackingBoton } from "../actualizar-tracking-boton";

function esPdf(url: string) {
  return url.toLowerCase().endsWith(".pdf");
}

export const metadata = { title: "Admin — Detalle de compra" };

export default async function DetalleCompraPage({ params }: { params: { id: string } }) {
  const compra = await obtenerCompra(params.id);
  if (!compra) notFound();
  const trackingApiDisponible = trackingDisponible();

  return (
    <RevealOnScroll className="max-w-2xl" y={16}>
      <div className="mb-6 flex items-center gap-2">
        <h1 className="font-display text-2xl font-bold">
          Compra — {nombreProveedor(compra)}
        </h1>
        <Badge variant="outline">{TIPO_ENVIO_ETIQUETA[compra.tipoEnvio]}</Badge>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Estado</span>
            <EstadoCompraSelector
              id={compra.id}
              estado={compra.estado}
              tipoEnvio={compra.tipoEnvio}
              tieneItemsNuevos={compra.items.some((it) => it.productoId === null)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Fecha de compra</p>
              <p>{new Date(compra.fechaCompra).toLocaleDateString("es-PE")}</p>
            </div>
            {compra.fechaLlegadaAlmacen && (
              <div>
                <p className="text-muted-foreground">Llegó al almacén USA</p>
                <p>{new Date(compra.fechaLlegadaAlmacen).toLocaleDateString("es-PE")}</p>
              </div>
            )}
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
            {compra.courierInternacional && (
              <div>
                <p className="text-muted-foreground">Courier internacional</p>
                <p>{compra.courierInternacional}</p>
              </div>
            )}
            {compra.courierNacional && (
              <div>
                <p className="text-muted-foreground">Courier nacional (Perú)</p>
                <p>{compra.courierNacional}</p>
              </div>
            )}
          </div>

          {(compra.trackingInternacional || compra.trackingNacional) && (
            <div className="space-y-3 rounded-xl border border-border/60 p-3 text-sm">
              {compra.trackingInternacional && (
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-muted-foreground">Tracking internacional</p>
                    <p className="font-mono text-xs">{compra.trackingInternacional}</p>
                    {compra.trackingInternacionalEstado && (
                      <p className="mt-0.5 text-xs text-primary">
                        {compra.trackingInternacionalEstado}
                      </p>
                    )}
                  </div>
                  <ActualizarTrackingBoton
                    compraId={compra.id}
                    tramo="internacional"
                    disponible={trackingApiDisponible}
                  />
                </div>
              )}
              {compra.trackingNacional && (
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-muted-foreground">Tracking nacional</p>
                    <p className="font-mono text-xs">{compra.trackingNacional}</p>
                    {compra.trackingNacionalEstado && (
                      <p className="mt-0.5 text-xs text-primary">{compra.trackingNacionalEstado}</p>
                    )}
                  </div>
                  <ActualizarTrackingBoton
                    compraId={compra.id}
                    tramo="nacional"
                    disponible={trackingApiDisponible}
                  />
                </div>
              )}
            </div>
          )}

          {compra.comprobanteUrls.length > 0 && (
            <div>
              <p className="mb-1.5 text-sm text-muted-foreground">Comprobantes</p>
              <div className="flex flex-wrap gap-2">
                {compra.comprobanteUrls.map((url) => (
                  <Link
                    key={url}
                    href={url}
                    target="_blank"
                    className="flex items-center gap-1 rounded-lg border border-border/60 px-2.5 py-1.5 text-sm text-primary hover:underline"
                  >
                    {esPdf(url) ? "PDF" : "Foto"} <ExternalLink className="size-3" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <h2 className="text-sm font-semibold">Productos</h2>
            {compra.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.cantidad}x {item.descripcion}
                  {item.pesoKg != null && (
                    <span className="ml-1.5 text-xs">({item.pesoKg} kg c/u)</span>
                  )}
                  {item.productoId ? (
                    <Link
                      href={`/admin/productos?editar=${item.productoId}`}
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

          <ImpuestosEditor
            compraId={compra.id}
            pagoImpuestos={compra.pagoImpuestos}
            montoImpuestos={compra.montoImpuestos}
          />

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
    </RevealOnScroll>
  );
}
