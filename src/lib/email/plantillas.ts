import { formatoPEN, formatoDireccion } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";
import type { PedidoMock } from "@/lib/pedidos/store";

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
