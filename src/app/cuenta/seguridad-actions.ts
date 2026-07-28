"use server";

import { auth } from "@/auth";
import {
  activarTotp,
  desactivarTotp,
  getUsuarioPorEmail,
  verificarCredenciales,
} from "@/lib/usuarios/store";
import { generarSecretoTotp, generarQrTotp, verificarCodigoTotp } from "@/lib/seguridad/totp";

export async function iniciarActivacionTotpAction() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) throw new Error("Debes iniciar sesión");

  const { secret, url } = generarSecretoTotp(session.user.email);
  const qr = await generarQrTotp(url);
  // El secreto viaja al cliente (necesario para mostrar el QR/código
  // manual) y vuelve en confirmarActivacionTotpAction — recién ahí se
  // guarda en la base, solo si el usuario probó que lo configuró bien.
  return { secret, qr };
}

export async function confirmarActivacionTotpAction(secret: string, codigo: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Debes iniciar sesión");

  if (!verificarCodigoTotp(secret, codigo)) {
    throw new Error("Código incorrecto. Verifica la hora de tu celular e intenta de nuevo.");
  }
  await activarTotp(session.user.id, secret);
}

/** password es opcional solo para cuentas sin contraseña propia (login
 * exclusivo con Google) — todas las demás deben confirmarla para
 * desactivar 2FA, el mismo patrón de "vuelve a autenticarte" para bajar
 * la guardia en algo sensible. */
export async function desactivarTotpAction(password?: string) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) throw new Error("Debes iniciar sesión");

  const usuario = await getUsuarioPorEmail(session.user.email);
  if (usuario?.passwordHash) {
    if (!password || !(await verificarCredenciales(session.user.email, password))) {
      throw new Error("Contraseña incorrecta");
    }
  }

  await desactivarTotp(session.user.id);
}
