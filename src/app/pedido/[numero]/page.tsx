import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Receipt } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RevealOnScroll } from "@/components/fx/reveal-on-scroll";
import { Magnetic } from "@/components/fx/magnetic";
import { EstadoPedidoBadge } from "@/components/pedidos/estado-pedido-badge";
import { ELASTIC_EASE, GLASS_CARD } from "@/lib/motion";
import { getPedido } from "@/lib/pedidos/store";
import { formatoPEN, formatoDireccion } from "@/lib/format";

export default async function PedidoConfirmacionPage({ params }: { params: { numero: string } }) {
  const pedido = await getPedido(params.numero);
  if (!pedido) notFound();

  return (
    <RevealOnScroll y={20} ease={ELASTIC_EASE} className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-full bg-primary/25 blur-2xl" />
          <CheckCircle2 className="size-14 text-primary" />
        </div>
        <h1 className="font-display mt-4 text-2xl font-bold sm:text-3xl">
          ¡Gracias por tu compra!
        </h1>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          Pedido <span className="font-mono font-semibold text-foreground">{pedido.numeroPedido}</span>
          <EstadoPedidoBadge estado={pedido.estado} />
        </p>
      </div>

      <Card className={`mt-8 ${GLASS_CARD}`}>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            {pedido.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.cantidad}x {item.nombreProducto}
                  {item.varianteLabel ? ` (${item.varianteLabel})` : ""}
                </span>
                <span className="font-mono">{formatoPEN(item.precioUnitario * item.cantidad)}</span>
              </div>
            ))}
          </div>
          <Separator />
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Op. gravada</span>
              <span className="font-mono">{formatoPEN(pedido.subtotal - pedido.igv)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IGV (18%, incluido)</span>
              <span className="font-mono">{formatoPEN(pedido.igv)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Envío</span>
              <span className="font-mono">{formatoPEN(pedido.costoEnvio)}</span>
            </div>
            {pedido.descuento > 0 && (
              <div className="flex justify-between text-primary">
                <span>Descuento{pedido.cuponCodigo ? ` (${pedido.cuponCodigo})` : ""}</span>
                <span className="font-mono">-{formatoPEN(pedido.descuento)}</span>
              </div>
            )}
          </div>
          <Separator />
          <div className="flex justify-between text-base font-bold">
            <span>Total pagado</span>
            <span className="font-mono">{formatoPEN(pedido.total)}</span>
          </div>

          <Separator />

          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              <span className="text-foreground">Envío a:</span> {formatoDireccion(pedido.direccion)}
            </p>
            <p>
              <span className="text-foreground">Comprobante:</span>{" "}
              {pedido.requiereFactura
                ? `Factura — RUC ${pedido.ruc} (${pedido.razonSocial})`
                : `Boleta — ${pedido.tipoDocumento.toUpperCase()} ${pedido.docComprador}`}
            </p>
          </div>

          {pedido.metodoPago !== "contra_entrega" && pedido.estado === "pendiente" && (
            <p className="rounded-xl border border-border/60 bg-secondary/40 p-4 text-xs text-muted-foreground">
              Tu pedido quedará confirmado apenas verifiquemos el pago. Te avisaremos por correo a{" "}
              {pedido.emailComprador}.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button variant="outline" asChild>
          <Link href={`/pedido/${pedido.numeroPedido}/boleta`}>
            <Receipt className="size-4" /> Ver boleta
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/productos">Seguir comprando</Link>
        </Button>
        <Magnetic strength={0.15} className="inline-block">
          <Button asChild>
            <Link href="/">Volver al inicio</Link>
          </Button>
        </Magnetic>
      </div>
    </RevealOnScroll>
  );
}
