import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Receipt } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getPedido } from "@/lib/pedidos/store";
import { formatoPEN, formatoDireccion } from "@/lib/format";

export default async function PedidoConfirmacionPage({ params }: { params: { numero: string } }) {
  const pedido = await getPedido(params.numero);
  if (!pedido) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center">
        <CheckCircle2 className="size-14 text-primary" />
        <h1 className="font-display mt-4 text-2xl font-bold sm:text-3xl">
          ¡Gracias por tu compra!
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pedido <span className="font-mono font-semibold text-foreground">{pedido.numeroPedido}</span>{" "}
          registrado como <span className="font-medium text-foreground">{pedido.estado}</span>.
        </p>
      </div>

      <Card className="mt-8">
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            {pedido.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.cantidad}x {item.nombreProducto}
                  {item.varianteLabel ? ` (${item.varianteLabel})` : ""}
                </span>
                <span>{formatoPEN(item.precioUnitario * item.cantidad)}</span>
              </div>
            ))}
          </div>
          <Separator />
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatoPEN(pedido.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IGV (18%)</span>
              <span>{formatoPEN(pedido.igv)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Envío</span>
              <span>{formatoPEN(pedido.costoEnvio)}</span>
            </div>
            {pedido.descuento > 0 && (
              <div className="flex justify-between text-primary">
                <span>Descuento{pedido.cuponCodigo ? ` (${pedido.cuponCodigo})` : ""}</span>
                <span>-{formatoPEN(pedido.descuento)}</span>
              </div>
            )}
          </div>
          <Separator />
          <div className="flex justify-between text-base font-bold">
            <span>Total pagado</span>
            <span>{formatoPEN(pedido.total)}</span>
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
        <Button asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
}
