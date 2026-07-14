import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { siteConfig } from "@/lib/site-config";

export const metadata = { title: "Política de Privacidad" };

export default function PrivacidadPage() {
  return (
    <LegalPageShell titulo="Política de Privacidad" actualizado="Julio 2026">
      <p>
        En {siteConfig.nombre} tratamos tus datos personales conforme a la Ley N° 29733, Ley de
        Protección de Datos Personales, y su reglamento.
      </p>

      <h2>1. Datos que recopilamos</h2>
      <p>
        Nombre, correo electrónico, teléfono, documento de identidad (DNI, RUC, Carnet de
        Extranjería o Pasaporte), direcciones de envío e historial de compras.
      </p>

      <h2>2. Finalidad</h2>
      <p>
        Usamos tus datos para procesar pedidos, emitir comprobantes de pago, coordinar el envío
        con el courier, enviarte notificaciones sobre el estado de tu pedido y, si lo autorizas,
        comunicarte ofertas.
      </p>

      <h2>3. Documento de identidad</h2>
      <p>
        El documento solicitado en el checkout se usa exclusivamente para la emisión del
        comprobante de venta (boleta o factura) y para que el courier identifique al destinatario
        al momento de la entrega. No se usa con fines distintos.
      </p>

      <h2>4. Encargo de tratamiento</h2>
      <p>
        Compartimos únicamente los datos necesarios con couriers (para la entrega) y pasarelas de
        pago (para procesar el cobro), quienes están obligados a proteger tu información.
      </p>

      <h2>5. Tus derechos</h2>
      <p>
        Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición (derechos
        ARCO) escribiendo a {siteConfig.email}.
      </p>
    </LegalPageShell>
  );
}
