import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import { siteConfig } from "@/lib/site-config";

/** Nuevo secreto TOTP + su URL otpauth:// (para el QR) — no se guarda en
 * la base todavía, eso pasa recién cuando el usuario confirma un código
 * válido (ver activarTotp en usuarios/store.ts). */
export function generarSecretoTotp(email: string) {
  const totp = new OTPAuth.TOTP({
    issuer: siteConfig.nombre,
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: new OTPAuth.Secret({ size: 20 }),
  });
  return { secret: totp.secret.base32, url: totp.toString() };
}

export async function generarQrTotp(otpauthUrl: string) {
  return QRCode.toDataURL(otpauthUrl);
}

/** Acepta el código del período actual y del anterior/siguiente (ventana
 * de 1) — un margen chico para relojes de celular ligeramente desfasados,
 * sin abrir tanto la ventana como para facilitar fuerza bruta. */
export function verificarCodigoTotp(secretBase32: string, codigo: string) {
  const totp = new OTPAuth.TOTP({
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secretBase32),
  });
  const delta = totp.validate({ token: codigo.trim(), window: 1 });
  return delta !== null;
}
