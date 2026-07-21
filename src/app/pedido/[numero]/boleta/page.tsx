import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getPedido } from "@/lib/pedidos/store";
import { formatoPEN, formatoDireccion } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";
import { ESTADO_PEDIDO_ETIQUETA } from "@/components/pedidos/estado-pedido-badge";
import { ImprimirBoton } from "./imprimir-boton";

export const metadata = { title: "Comprobante de pago" };

const IGV_PORCENTAJE = 18;

const METODO_PAGO_ETIQUETA: Record<string, string> = {
  yape: "Yape / Plin",
  prex: "Prex",
  transferencia: "Transferencia bancaria",
  contra_entrega: "Contra entrega",
  tarjeta: "Tarjeta de crédito/débito",
};

export default async function BoletaPage({ params }: { params: { numero: string } }) {
  const pedido = await getPedido(params.numero);
  if (!pedido) notFound();

  const esFactura = pedido.requiereFactura;
  // Formato tipo SUNAT (serie-correlativo) simulado a partir del número
  // interno de pedido — no es un comprobante homologado, ver aviso abajo.
  const correlativo = pedido.numeroPedido.replace(/\D/g, "").slice(-8).padStart(8, "0");
  const numeroComprobante = `${esFactura ? "F001" : "B001"}-${correlativo}`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link
          href={`/pedido/${pedido.numeroPedido}`}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Volver al pedido
        </Link>
        <ImprimirBoton />
      </div>

      {/* Colores explícitos con `print:` (no solo la variable --foreground
          de globals.css) — Safari/WebKit no siempre recalcula custom
          properties de CSS dentro de @media print, así que depender solo
          de la variable dejaba el comprobante en blanco ahí aunque en
          Chrome se viera bien. Con clases print: literales (print:text-black,
          print:text-neutral-600, print:border-neutral-300) el color queda
          fijo sin pasar por ninguna variable, funciona en cualquier motor. */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card print:rounded-none print:border-0 print:bg-white print:text-black">
        <div className="h-1.5 bg-primary print:hidden" />
        <div className="p-8 print:p-0">
        <div className="flex items-start justify-between gap-4 border-b border-border pb-6 print:border-neutral-300">
          <div>
            <p className="font-display text-lg font-semibold print:text-black">{siteConfig.nombre}</p>
            <p className="text-xs text-muted-foreground print:text-neutral-600">
              RUC 20000000001 (simulado — fase de prueba)
            </p>
            <p className="text-xs text-muted-foreground print:text-neutral-600">Lima, Perú</p>
            <p className="text-xs text-muted-foreground print:text-neutral-600">{siteConfig.email}</p>
          </div>
          <div className="rounded-lg border border-border px-4 py-3 text-right print:border-neutral-300">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground print:text-neutral-600">
              {esFactura ? "Factura electrónica" : "Boleta de venta electrónica"}
            </p>
            <p className="font-mono text-base font-semibold print:text-black">{numeroComprobante}</p>
          </div>
        </div>

        <div className="grid gap-4 border-b border-border py-6 sm:grid-cols-2 print:border-neutral-300">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground print:text-neutral-600">
              {esFactura ? "Cliente" : "Señor(a)"}
            </p>
            <p className="mt-1 text-sm font-medium print:text-black">
              {esFactura ? pedido.razonSocial : pedido.nombreComprador}
            </p>
            <p className="text-xs text-muted-foreground print:text-neutral-600">
              {esFactura ? "RUC" : pedido.tipoDocumento.toUpperCase()}:{" "}
              {esFactura ? pedido.ruc : pedido.docComprador}
            </p>
            <p className="text-xs text-muted-foreground print:text-neutral-600">{pedido.emailComprador}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground print:text-neutral-600">
              Fecha de emisión
            </p>
            <p className="mt-1 text-sm print:text-black">
              {new Date(pedido.createdAt).toLocaleDateString("es-PE", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground print:text-neutral-600">
              Envío a
            </p>
            <p className="text-xs text-muted-foreground print:text-neutral-600">{formatoDireccion(pedido.direccion)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-b border-border py-6 sm:grid-cols-3 print:border-neutral-300">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground print:text-neutral-600">
              Método de pago
            </p>
            <p className="mt-1 text-sm print:text-black">
              {METODO_PAGO_ETIQUETA[pedido.metodoPago] ?? pedido.metodoPago}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground print:text-neutral-600">
              Estado del pedido
            </p>
            <p className="mt-1 text-sm print:text-black">{ESTADO_PEDIDO_ETIQUETA[pedido.estado]}</p>
          </div>
          {pedido.courier && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground print:text-neutral-600">
                Courier{pedido.numeroTracking ? " / tracking" : ""}
              </p>
              <p className="mt-1 text-sm print:text-black">
                {pedido.courier}
                {pedido.numeroTracking && ` — ${pedido.numeroTracking}`}
              </p>
            </div>
          )}
        </div>

        <table className="w-full border-b border-border text-sm print:border-neutral-300">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground print:text-neutral-600">
              <th className="py-3">Descripción</th>
              <th className="py-3 text-center">Cant.</th>
              <th className="py-3 text-right">P. unitario</th>
              <th className="py-3 text-right">Importe</th>
            </tr>
          </thead>
          <tbody>
            {pedido.items.map((item, i) => (
              <tr
                key={i}
                className={`border-t border-border/60 print:border-neutral-300 ${
                  i % 2 === 1 ? "bg-secondary/30 print:bg-neutral-50" : ""
                }`}
              >
                <td className="py-3 pr-2 print:text-black">
                  {item.nombreProducto}
                  {item.varianteLabel && (
                    <span className="text-muted-foreground print:text-neutral-600"> ({item.varianteLabel})</span>
                  )}
                </td>
                <td className="py-3 text-center print:text-black">{item.cantidad}</td>
                <td className="py-3 text-right print:text-black">{formatoPEN(item.precioUnitario)}</td>
                <td className="py-3 text-right print:text-black">
                  {formatoPEN(item.precioUnitario * item.cantidad)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end py-6">
          <div className="w-56 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground print:text-neutral-600">Op. gravada</span>
              <span className="print:text-black">{formatoPEN(pedido.subtotal - pedido.igv)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground print:text-neutral-600">IGV ({IGV_PORCENTAJE}%)</span>
              <span className="print:text-black">{formatoPEN(pedido.igv)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground print:text-neutral-600">Envío</span>
              <span className="print:text-black">{formatoPEN(pedido.costoEnvio)}</span>
            </div>
            {pedido.descuento > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground print:text-neutral-600">
                  Descuento{pedido.cuponCodigo ? ` (${pedido.cuponCodigo})` : ""}
                </span>
                <span className="print:text-black">-{formatoPEN(pedido.descuento)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-1.5 text-base font-semibold print:border-neutral-300">
              <span className="print:text-black">Total</span>
              <span className="print:text-black">{formatoPEN(pedido.total)}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4 text-center print:border-neutral-300">
          <p className="text-sm font-medium print:text-black">¡Gracias por tu compra!</p>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground print:text-neutral-600">
            Comprobante simulado — proyecto en fase de prueba (MVP). No constituye un comprobante de
            pago electrónico homologado por SUNAT.
          </p>
          <p className="mt-2 text-[10px] text-muted-foreground print:text-neutral-600">
            Documento generado el{" "}
            {new Date().toLocaleDateString("es-PE", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
