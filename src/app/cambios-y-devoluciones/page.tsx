import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { siteConfig } from "@/lib/site-config";

export const metadata = { title: "Cambios y Devoluciones" };

export default function CambiosDevolucionesPage() {
  return (
    <LegalPageShell titulo="Cambios y Devoluciones" actualizado="Julio 2026">
      <p>
        Queremos que tu compra de electrónica llegue en perfecto estado. Esta política aplica a
        todos los productos vendidos en {siteConfig.nombre}.
      </p>

      <h2>1. Producto con falla de fábrica</h2>
      <p>
        Si tu producto presenta una falla de fábrica, tienes hasta 7 días calendario desde la
        entrega para solicitar el cambio sin costo, presentando el comprobante de compra.
      </p>

      <h2>2. Garantía</h2>
      <p>
        Cada producto indica en su ficha técnica los meses de garantía del fabricante o de{" "}
        {siteConfig.nombre}. Pasado el plazo de cambio directo, la garantía se gestiona con el
        servicio técnico autorizado de la marca.
      </p>

      <h2>3. Condiciones para el cambio</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>El producto debe conservar su empaque original, accesorios y manuales.</li>
        <li>No debe presentar señales de mal uso o daño físico ajeno a la falla reportada.</li>
        <li>Se debe adjuntar el comprobante de compra (boleta o factura).</li>
      </ul>

      <h2>4. Retracto de compra</h2>
      <p>
        Al ser una compra por internet, tienes derecho a desistir de la compra dentro de los 7
        días calendario posteriores a la entrega, siempre que el producto no haya sido usado y
        conserve su empaque original.
      </p>

      <h2>5. ¿Cómo solicitar un cambio o devolución?</h2>
      <p>
        Escríbenos a {siteConfig.email} o por WhatsApp indicando tu número de pedido y el motivo.
        Si prefieres dejar un reclamo formal, puedes usar nuestro{" "}
        <a className="underline" href="/libro-de-reclamaciones">Libro de Reclamaciones virtual</a>.
      </p>
    </LegalPageShell>
  );
}
