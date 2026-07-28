import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getPedido, puedeVerPedido } from "@/lib/pedidos/store";
import { formatoPEN, formatoDireccion, METODO_PAGO_ETIQUETA, numeroComprobante } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";
import { ESTADO_PEDIDO_ETIQUETA } from "@/components/pedidos/estado-pedido-badge";
import { auth } from "@/auth";
import { ImprimirBoton } from "../boleta/imprimir-boton";

export const metadata = { title: "Ticket 80mm" };

/**
 * Mismo pedido que la boleta (`/pedido/[numero]/boleta`), pero en un
 * formato angosto pensado para imprimir directo en una ticketera térmica
 * de 80mm (empaque/despacho) en vez de una hoja A4 — sin logo ni tablas,
 * todo en una sola columna monoespaciada, como un ticket de caja real.
 * `@page { size: 80mm auto }` le pide al driver de impresión el ancho de
 * rollo correcto; la mayoría de ticketeras térmicas lo respetan si están
 * instaladas con su papel de 80mm configurado.
 */
export default async function TicketPage({
  params,
  searchParams,
}: {
  params: { numero: string };
  searchParams: { t?: string };
}) {
  const pedido = await getPedido(params.numero);
  if (!pedido) notFound();

  const session = await auth();
  if (
    !puedeVerPedido(pedido, {
      usuarioId: session?.user?.id,
      esAdmin: session?.user?.rol === "admin",
      token: searchParams.t,
    })
  ) {
    notFound();
  }

  const esFactura = pedido.requiereFactura;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Ancho de página + márgenes solo para esta ruta — el resto del
          sitio imprime en A4/Letter por default del navegador. */}
      <style>{`@page { size: 80mm auto; margin: 4mm; }`}</style>

      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link
          href={`/pedido/${pedido.numeroPedido}/boleta?t=${pedido.tokenAcceso}`}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Ver boleta completa
        </Link>
        <ImprimirBoton />
      </div>

      <p className="mb-4 text-center text-xs text-muted-foreground print:hidden">
        Vista previa a escala — el ancho real al imprimir es de 80mm.
      </p>

      {/* Contenedor angosto (80mm ≈ 302px a 96dpi) con borde/sombra solo en
          pantalla para que se note que es una vista previa de un rollo de
          papel, no la página completa. print:w-full para que ocupe el
          ancho real del rollo al imprimir de verdad (el @page de arriba ya
          define ese ancho). */}
      <div className="mx-auto w-[302px] border border-dashed border-border bg-card p-4 font-mono text-[11px] leading-relaxed text-foreground shadow-sm print:w-full print:border-0 print:bg-white print:text-black print:shadow-none">
        <div className="text-center">
          <p className="text-sm font-bold">{siteConfig.nombre}</p>
          <p>Electrónica y tecnología</p>
          <p>RUC 20000000001 (simulado)</p>
          <p>Lima, Perú</p>
        </div>

        <div className="my-2 border-t border-dashed border-current" />

        <p>{esFactura ? "Factura" : "Boleta"}: {numeroComprobante(pedido.numeroPedido, esFactura)}</p>
        <p>Pedido: {pedido.numeroPedido}</p>
        <p>
          Fecha:{" "}
          {new Date(pedido.createdAt).toLocaleString("es-PE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        <div className="my-2 border-t border-dashed border-current" />

        <p className="font-bold">{esFactura ? pedido.razonSocial : pedido.nombreComprador}</p>
        <p>
          {esFactura ? "RUC" : pedido.tipoDocumento.toUpperCase()}: {esFactura ? pedido.ruc : pedido.docComprador}
        </p>
        <p className="break-words">Envío: {formatoDireccion(pedido.direccion)}</p>

        <div className="my-2 border-t border-dashed border-current" />

        {pedido.items.map((item, i) => (
          <div key={i} className="mb-1 flex justify-between gap-2">
            <span className="flex-1 break-words">
              {item.cantidad}x {item.nombreProducto}
              {item.varianteLabel ? ` (${item.varianteLabel})` : ""}
            </span>
            <span className="shrink-0">{formatoPEN(item.precioUnitario * item.cantidad)}</span>
          </div>
        ))}

        <div className="my-2 border-t border-dashed border-current" />

        <div className="flex justify-between">
          <span>Op. gravada</span>
          <span>{formatoPEN(pedido.subtotal - pedido.igv)}</span>
        </div>
        <div className="flex justify-between">
          <span>IGV (18%)</span>
          <span>{formatoPEN(pedido.igv)}</span>
        </div>
        <div className="flex justify-between">
          <span>Envío</span>
          <span>{formatoPEN(pedido.costoEnvio)}</span>
        </div>
        {pedido.descuento > 0 && (
          <div className="flex justify-between">
            <span>Descuento{pedido.cuponCodigo ? ` (${pedido.cuponCodigo})` : ""}</span>
            <span>-{formatoPEN(pedido.descuento)}</span>
          </div>
        )}

        <div className="my-2 border-t border-dashed border-current" />

        <div className="flex justify-between text-sm font-bold">
          <span>TOTAL</span>
          <span>{formatoPEN(pedido.total)}</span>
        </div>

        <div className="my-2 border-t border-dashed border-current" />

        <p>Pago: {METODO_PAGO_ETIQUETA[pedido.metodoPago] ?? pedido.metodoPago}</p>
        <p>Estado: {ESTADO_PEDIDO_ETIQUETA[pedido.estado]}</p>
        {pedido.courier && (
          <p className="break-words">
            Courier: {pedido.courier}
            {pedido.numeroTracking && ` — ${pedido.numeroTracking}`}
          </p>
        )}

        <div className="my-2 border-t border-dashed border-current" />

        <div className="text-center">
          <p className="font-bold">¡Gracias por tu compra!</p>
          <p className="mt-1 text-[10px] leading-tight">
            Comprobante simulado — proyecto en fase de prueba (MVP). No constituye un comprobante de
            pago electrónico homologado por SUNAT.
          </p>
        </div>
      </div>
    </div>
  );
}
