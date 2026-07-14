import { MercadoPagoConfig } from "mercadopago";

/**
 * Cliente de Mercado Pago en modo sandbox: usa el Access Token de PRUEBA
 * de tu cuenta de Mercado Pago Developers (nunca el de producción en
 * este entorno). Se instancia solo cuando se necesita (no en el import
 * top-level) para no reventar el build si la env var no está seteada
 * todavía — ver .env.example.
 */
export function getMercadoPagoClient() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error(
      "Falta MERCADOPAGO_ACCESS_TOKEN. Crea una cuenta de prueba en https://www.mercadopago.com.pe/developers y copia el Access Token de prueba a .env.local.",
    );
  }
  return new MercadoPagoConfig({ accessToken });
}
