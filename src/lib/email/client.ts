import nodemailer from "nodemailer";

/**
 * Envío de correos vía Gmail SMTP (cuenta de soporte + contraseña de
 * aplicación, no la contraseña normal — se genera en
 * myaccount.google.com/apppasswords). Igual que apiperu.dev o
 * Mercado Pago: si falta configurar, nunca bloquea el flujo que lo
 * llama — solo se registra en el log del servidor y sigue.
 */
let transportador: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransportador() {
  const usuario = process.env.EMAIL_USER;
  const clave = process.env.EMAIL_APP_PASSWORD;
  if (!usuario || !clave) return null;

  if (!transportador) {
    transportador = nodemailer.createTransport({
      service: "gmail",
      auth: { user: usuario, pass: clave },
    });
  }
  return transportador;
}

export async function enviarCorreo(input: { para: string; asunto: string; html: string }) {
  const transporte = getTransportador();
  if (!transporte) {
    console.warn(`[email] EMAIL_USER/EMAIL_APP_PASSWORD no configurados — no se envió "${input.asunto}" a ${input.para}`);
    return { enviado: false };
  }

  try {
    await transporte.sendMail({
      from: `"BYTE.PE" <${process.env.EMAIL_USER}>`,
      to: input.para,
      subject: input.asunto,
      html: input.html,
    });
    return { enviado: true };
  } catch (error) {
    // Nunca tumbar el flujo que llama por un correo que no salió (ej. el
    // pedido ya se creó de verdad, no tiene sentido fallar la compra).
    console.error(`[email] Error enviando "${input.asunto}" a ${input.para}:`, error);
    return { enviado: false };
  }
}
