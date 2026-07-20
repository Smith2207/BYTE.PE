import { formatoPEN, formatoDireccion } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";
import type { PedidoMock } from "@/lib/pedidos/store";
import type { ReclamoAlmacenado } from "@/lib/reclamos/store";

const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

function envoltorio(contenido: string) {
  return `
  <div style="background:#0d0d0d;padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#161616;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;">
      <div style="padding:24px 28px;border-bottom:1px solid #2a2a2a;">
        <span style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">${siteConfig.nombre}</span>
      </div>
      <div style="padding:28px;color:#e5e5e5;">
        ${contenido}
      </div>
      <div style="padding:20px 28px;border-top:1px solid #2a2a2a;color:#8a8a8a;font-size:12px;">
        ${siteConfig.nombre} · Lima, Perú · ${siteConfig.email}
      </div>
    </div>
  </div>`;
}

function filaItem(item: PedidoMock["items"][number]) {
  return `
    <tr>
      <td style="padding:8px 0;color:#e5e5e5;font-size:14px;">
        ${item.cantidad}x ${item.nombreProducto}${item.varianteLabel ? ` (${item.varianteLabel})` : ""}
      </td>
      <td style="padding:8px 0;color:#e5e5e5;font-size:14px;text-align:right;white-space:nowrap;">
        ${formatoPEN(item.precioUnitario * item.cantidad)}
      </td>
    </tr>`;
}

export function plantillaConfirmacionPedido(pedido: PedidoMock) {
  const filas = pedido.items.map(filaItem).join("");
  const contenido = `
    <h1 style="margin:0 0 4px;font-size:20px;color:#ffffff;">¡Gracias por tu compra, ${pedido.nombreComprador.split(" ")[0]}!</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#a3a3a3;">
      Registramos tu pedido <strong style="color:#e5e5e5;">${pedido.numeroPedido}</strong>. Te avisaremos por
      correo apenas verifiquemos el pago.
    </p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
      ${filas}
    </table>
    <div style="border-top:1px solid #2a2a2a;padding-top:12px;margin-top:8px;display:flex;justify-content:space-between;font-size:16px;font-weight:700;color:#ffffff;">
      <table style="width:100%;"><tr>
        <td style="color:#ffffff;font-weight:700;">Total</td>
        <td style="text-align:right;color:#ffffff;font-weight:700;">${formatoPEN(pedido.total)}</td>
      </tr></table>
    </div>
    <p style="margin:20px 0 4px;font-size:13px;color:#a3a3a3;">Envío a</p>
    <p style="margin:0 0 20px;font-size:14px;color:#e5e5e5;">${formatoDireccion(pedido.direccion)}</p>
    <a href="${BASE_URL}/pedido/${pedido.numeroPedido}"
       style="display:inline-block;background:#3987e5;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:10px;">
      Ver mi pedido
    </a>
    <p style="margin:20px 0 0;font-size:12px;color:#6b6b6b;">
      Comprobante simulado — proyecto en fase de prueba (MVP).
    </p>`;
  return envoltorio(contenido);
}

export function plantillaNuevoPedidoAdmin(pedido: PedidoMock) {
  const filas = pedido.items.map(filaItem).join("");
  const contenido = `
    <h1 style="margin:0 0 4px;font-size:20px;color:#ffffff;">Nuevo pedido: ${pedido.numeroPedido}</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#a3a3a3;">
      ${pedido.nombreComprador} · ${pedido.emailComprador} · ${pedido.telefonoComprador}
    </p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
      ${filas}
    </table>
    <div style="border-top:1px solid #2a2a2a;padding-top:12px;margin-top:8px;">
      <table style="width:100%;"><tr>
        <td style="color:#ffffff;font-weight:700;font-size:16px;">Total</td>
        <td style="text-align:right;color:#ffffff;font-weight:700;font-size:16px;">${formatoPEN(pedido.total)}</td>
      </tr></table>
    </div>
    <p style="margin:20px 0 4px;font-size:13px;color:#a3a3a3;">Pago</p>
    <p style="margin:0 0 20px;font-size:14px;color:#e5e5e5;">${pedido.metodoPago}</p>
    <a href="${BASE_URL}/admin/pedidos"
       style="display:inline-block;background:#3987e5;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:10px;">
      Ver en el panel admin
    </a>`;
  return envoltorio(contenido);
}

export function plantillaRespuestaReclamo(reclamo: ReclamoAlmacenado) {
  const esResuelto = reclamo.estado === "resuelto";
  const contenido = `
    <h1 style="margin:0 0 4px;font-size:20px;color:#ffffff;">
      Actualización de tu ${reclamo.tipo} — ${reclamo.folio}
    </h1>
    <p style="margin:0 0 20px;font-size:14px;color:#a3a3a3;">
      Hola ${reclamo.nombre.split(" ")[0]}, esto es lo que respondimos a tu
      ${reclamo.tipo} registrado en nuestro Libro de Reclamaciones.
    </p>
    <div style="background:#1f1f1f;border-radius:12px;padding:16px 20px;margin-bottom:16px;">
      <p style="margin:0 0 4px;font-size:12px;color:#8a8a8a;">Tu reclamo</p>
      <p style="margin:0;font-size:14px;color:#e5e5e5;">${reclamo.detalleReclamo}</p>
    </div>
    <div style="background:#1f1f1f;border-radius:12px;padding:16px 20px;">
      <p style="margin:0 0 4px;font-size:12px;color:#8a8a8a;">Nuestra respuesta</p>
      <p style="margin:0;font-size:14px;color:#e5e5e5;">${reclamo.respuesta}</p>
    </div>
    <p style="margin:20px 0 0;font-size:13px;color:#a3a3a3;">
      Estado actual: <strong style="color:#e5e5e5;">${esResuelto ? "Resuelto" : "En proceso"}</strong>
    </p>
    <p style="margin:16px 0 0;font-size:12px;color:#6b6b6b;">
      Si tienes alguna consulta adicional sobre este caso, responde a este correo o
      escríbenos a ${siteConfig.email}.
    </p>`;
  return envoltorio(contenido);
}

export function plantillaSolicitudDevolucionRecibida(input: {
  nombre: string;
  pedidoNumero: string;
  tipo: "reembolso" | "cambio";
  motivo: string;
}) {
  const contenido = `
    <h1 style="margin:0 0 4px;font-size:20px;color:#ffffff;">
      Recibimos tu solicitud de ${input.tipo === "reembolso" ? "reembolso" : "cambio"}
    </h1>
    <p style="margin:0 0 20px;font-size:14px;color:#a3a3a3;">
      Hola ${input.nombre.split(" ")[0]}, registramos tu solicitud sobre el pedido
      <strong style="color:#e5e5e5;">${input.pedidoNumero}</strong>. La revisamos y te
      contactamos apenas tengamos una respuesta.
    </p>
    <div style="background:#1f1f1f;border-radius:12px;padding:16px 20px;">
      <p style="margin:0 0 4px;font-size:12px;color:#8a8a8a;">Motivo indicado</p>
      <p style="margin:0;font-size:14px;color:#e5e5e5;">${input.motivo}</p>
    </div>
    <p style="margin:20px 0 0;font-size:12px;color:#6b6b6b;">
      Puedes ver el estado de tu pedido en cualquier momento desde tu cuenta.
    </p>`;
  return envoltorio(contenido);
}

export function plantillaSolicitudDevolucionActualizada(input: {
  nombre: string;
  pedidoNumero: string;
  estado: "aprobada" | "rechazada" | "completada";
  notaAdmin?: string | null;
  montoReembolsado?: number | null;
}) {
  const titulos: Record<typeof input.estado, string> = {
    aprobada: "Tu solicitud fue aprobada",
    rechazada: "Tu solicitud fue rechazada",
    completada: "Tu reembolso fue procesado",
  };
  const cuerpos: Record<typeof input.estado, string> = {
    aprobada:
      "Aprobamos tu solicitud. Te contactaremos para coordinar la devolución del producto.",
    rechazada: "Después de revisarla, no pudimos aprobar tu solicitud.",
    completada: `Procesamos el reembolso de ${
      input.montoReembolsado != null ? formatoPEN(input.montoReembolsado) : ""
    } por tu pedido ${input.pedidoNumero}.`,
  };
  const contenido = `
    <h1 style="margin:0 0 4px;font-size:20px;color:#ffffff;">${titulos[input.estado]}</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#a3a3a3;">
      Hola ${input.nombre.split(" ")[0]}, sobre tu solicitud del pedido
      <strong style="color:#e5e5e5;">${input.pedidoNumero}</strong>: ${cuerpos[input.estado]}
    </p>
    ${
      input.notaAdmin
        ? `<div style="background:#1f1f1f;border-radius:12px;padding:16px 20px;">
             <p style="margin:0 0 4px;font-size:12px;color:#8a8a8a;">Detalle</p>
             <p style="margin:0;font-size:14px;color:#e5e5e5;">${input.notaAdmin}</p>
           </div>`
        : ""
    }
    <p style="margin:20px 0 0;font-size:12px;color:#6b6b6b;">
      Cualquier duda, responde a este correo o escríbenos a ${siteConfig.email}.
    </p>`;
  return envoltorio(contenido);
}

export function plantillaAvisoStockDisponible(producto: { nombre: string; slug: string }) {
  const contenido = `
    <h1 style="margin:0 0 4px;font-size:20px;color:#ffffff;">¡Ya volvió el stock!</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#a3a3a3;">
      <strong style="color:#e5e5e5;">${producto.nombre}</strong>, que nos pediste que te avisáramos, ya
      está disponible.
    </p>
    <a href="${BASE_URL}/productos/${producto.slug}"
       style="display:inline-block;background:#3987e5;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:10px;">
      Ver producto
    </a>`;
  return envoltorio(contenido);
}

export function plantillaBajadaPrecioWishlist(
  producto: { nombre: string; slug: string },
  precioAnterior: number,
  precioActual: number,
) {
  const contenido = `
    <h1 style="margin:0 0 4px;font-size:20px;color:#ffffff;">Bajó de precio</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#a3a3a3;">
      <strong style="color:#e5e5e5;">${producto.nombre}</strong>, que tienes en tu lista de deseos, ahora
      cuesta <strong style="color:#ffffff;">${formatoPEN(precioActual)}</strong>
      <span style="text-decoration:line-through;color:#6b6b6b;margin-left:6px;">${formatoPEN(precioAnterior)}</span>.
    </p>
    <a href="${BASE_URL}/productos/${producto.slug}"
       style="display:inline-block;background:#3987e5;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:10px;">
      Ver producto
    </a>`;
  return envoltorio(contenido);
}

export function plantillaCarritoAbandonado(input: {
  nombre: string;
  items: { nombre: string; cantidad: number; precioUnitario: number }[];
  subtotal: number;
}) {
  const filas = input.items
    .map(
      (item) => `
    <tr>
      <td style="padding:8px 0;color:#e5e5e5;font-size:14px;">${item.cantidad}x ${item.nombre}</td>
      <td style="padding:8px 0;color:#e5e5e5;font-size:14px;text-align:right;white-space:nowrap;">
        ${formatoPEN(item.precioUnitario * item.cantidad)}
      </td>
    </tr>`,
    )
    .join("");
  const contenido = `
    <h1 style="margin:0 0 4px;font-size:20px;color:#ffffff;">Dejaste algo en tu carrito</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#a3a3a3;">
      Hola ${input.nombre.split(" ")[0]}, estos productos siguen esperándote en tu carrito de ${siteConfig.nombre}.
    </p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
      ${filas}
    </table>
    <div style="border-top:1px solid #2a2a2a;padding-top:12px;margin-top:8px;">
      <table style="width:100%;"><tr>
        <td style="color:#ffffff;font-weight:700;">Subtotal</td>
        <td style="text-align:right;color:#ffffff;font-weight:700;">${formatoPEN(input.subtotal)}</td>
      </tr></table>
    </div>
    <a href="${BASE_URL}/carrito"
       style="display:inline-block;margin-top:20px;background:#3987e5;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:10px;">
      Volver a mi carrito
    </a>`;
  return envoltorio(contenido);
}

export function plantillaRecuperarContrasena(nombre: string, token: string) {
  const resetUrl = `${BASE_URL}/restablecer-contrasena/${token}`;
  const contenido = `
    <h1 style="margin:0 0 4px;font-size:20px;color:#ffffff;">Recupera tu contraseña</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#a3a3a3;">
      Hola ${nombre.split(" ")[0]}, recibimos una solicitud para restablecer tu contraseña en ${siteConfig.nombre}.
      Si no fuiste tú, puedes ignorar este correo — tu contraseña actual sigue funcionando.
    </p>
    <a href="${resetUrl}"
       style="display:inline-block;background:#3987e5;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:10px;">
      Crear nueva contraseña
    </a>
    <p style="margin:20px 0 0;font-size:12px;color:#6b6b6b;">
      Este enlace vence en 1 hora y solo funciona una vez.
    </p>`;
  return envoltorio(contenido);
}
