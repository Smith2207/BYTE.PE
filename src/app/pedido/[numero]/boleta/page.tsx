import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getPedido } from "@/lib/pedidos/store";
import { formatoPEN, formatoDireccion } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";
import { ImprimirBoton } from "./imprimir-boton";

export const metadata = { title: "Comprobante de pago" };

const IGV_PORCENTAJE = 18;

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

      <div className="rounded-2xl border border-border bg-card p-8 print:rounded-none print:border-0 print:bg-white print:p-0 print:text-black">
        <div className="flex items-start justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="font-display text-lg font-semibold">{siteConfig.nombre}</p>
            <p className="text-xs text-muted-foreground">
              RUC 20000000001 (simulado — fase de prueba)
            </p>
            <p className="text-xs text-muted-foreground">Lima, Perú</p>
            <p className="text-xs text-muted-foreground">{siteConfig.email}</p>
          </div>
          <div className="rounded-lg border border-border px-4 py-3 text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {esFactura ? "Factura electrónica" : "Boleta de venta electrónica"}
            </p>
            <p className="font-mono text-base font-semibold">{numeroComprobante}</p>
          </div>
        </div>

        <div className="grid gap-4 border-b border-border py-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {esFactura ? "Cliente" : "Señor(a)"}
            </p>
            <p className="mt-1 text-sm font-medium">
              {esFactura ? pedido.razonSocial : pedido.nombreComprador}
            </p>
            <p className="text-xs text-muted-foreground">
              {esFactura ? "RUC" : pedido.tipoDocumento.toUpperCase()}:{" "}
              {esFactura ? pedido.ruc : pedido.docComprador}
            </p>
            <p className="text-xs text-muted-foreground">{pedido.emailComprador}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Fecha de emisión
            </p>
            <p className="mt-1 text-sm">
              {new Date(pedido.createdAt).toLocaleDateString("es-PE", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Envío a
            </p>
            <p className="text-xs text-muted-foreground">{formatoDireccion(pedido.direccion)}</p>
          </div>
        </div>

        <table className="w-full border-b border-border text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="py-3">Descripción</th>
              <th className="py-3 text-center">Cant.</th>
              <th className="py-3 text-right">P. unitario</th>
              <th className="py-3 text-right">Importe</th>
            </tr>
          </thead>
          <tbody>
            {pedido.items.map((item, i) => (
              <tr key={i} className="border-t border-border/60">
                <td className="py-3 pr-2">
                  {item.nombreProducto}
                  {item.varianteLabel && (
                    <span className="text-muted-foreground"> ({item.varianteLabel})</span>
                  )}
                </td>
                <td className="py-3 text-center">{item.cantidad}</td>
                <td className="py-3 text-right">{formatoPEN(item.precioUnitario)}</td>
                <td className="py-3 text-right">
                  {formatoPEN(item.precioUnitario * item.cantidad)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end py-6">
          <div className="w-56 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Op. gravada</span>
              <span>{formatoPEN(pedido.subtotal - pedido.igv)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IGV ({IGV_PORCENTAJE}%)</span>
              <span>{formatoPEN(pedido.igv)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Envío</span>
              <span>{formatoPEN(pedido.costoEnvio)}</span>
            </div>
            {pedido.descuento > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Descuento{pedido.cuponCodigo ? ` (${pedido.cuponCodigo})` : ""}
                </span>
                <span>-{formatoPEN(pedido.descuento)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-1.5 text-base font-semibold">
              <span>Total</span>
              <span>{formatoPEN(pedido.total)}</span>
            </div>
          </div>
        </div>

        <p className="border-t border-border pt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
          Comprobante simulado — proyecto en fase de prueba (MVP). No constituye un comprobante de
          pago electrónico homologado por SUNAT.
        </p>
      </div>
    </div>
  );
}
