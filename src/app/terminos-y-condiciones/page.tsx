import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { siteConfig } from "@/lib/site-config";

export const metadata = { title: "Términos y Condiciones" };

export default function TerminosPage() {
  return (
    <LegalPageShell titulo="Términos y Condiciones" actualizado="Julio 2026">
      <p>
        Estos Términos y Condiciones regulan el uso de {siteConfig.nombre} y la compra de
        productos a través de esta plataforma. Al registrarte o realizar un pedido, aceptas los
        términos aquí descritos.
      </p>

      <h2>1. Objeto</h2>
      <p>
        {siteConfig.nombre} es una tienda en línea dedicada a la venta de equipos electrónicos
        (laptops, celulares, tablets, PCs y accesorios) en Perú, actualmente en fase de prueba
        (MVP).
      </p>

      <h2>2. Precios e IGV</h2>
      <p>
        Todos los precios mostrados en el catálogo incluyen el Impuesto General a las Ventas
        (IGV) vigente de 18%, desglosado en el resumen de compra y en el comprobante emitido.
      </p>

      <h2>3. Comprobante de pago</h2>
      <p>
        Se emite boleta de venta con los datos del comprador. Si el cliente requiere factura,
        debe indicar RUC y razón social durante el checkout.
      </p>

      <h2>4. Métodos de pago</h2>
      <p>
        Aceptamos tarjeta (modo sandbox mientras el proyecto esté en fase de prueba), Yape/Plin
        con validación manual de comprobante, transferencia bancaria y pago contra entrega según
        disponibilidad por zona.
      </p>

      <h2>5. Envíos</h2>
      <p>
        El costo y tiempo estimado de envío se calculan según el departamento de destino y se
        muestran antes de confirmar la compra. El seguimiento se entrega una vez despachado el
        pedido.
      </p>

      <h2>6. Cambios y devoluciones</h2>
      <p>
        Consulta nuestra <a className="underline" href="/cambios-y-devoluciones">Política de
        Cambios y Devoluciones</a> para conocer plazos y condiciones.
      </p>

      <h2>7. Reclamos</h2>
      <p>
        Puedes registrar una queja o reclamo en cualquier momento a través de nuestro{" "}
        <a className="underline" href="/libro-de-reclamaciones">Libro de Reclamaciones virtual</a>
        , conforme a lo establecido por INDECOPI.
      </p>

      <h2>8. Protección de datos personales</h2>
      <p>
        El tratamiento de tus datos personales se rige por nuestra{" "}
        <a className="underline" href="/privacidad">Política de Privacidad</a>, en cumplimiento
        de la Ley N° 29733, Ley de Protección de Datos Personales.
      </p>
    </LegalPageShell>
  );
}
