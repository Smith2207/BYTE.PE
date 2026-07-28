import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { usuarios, passwordResetTokens, emailVerificationTokens, pedidos, cuponUsos } from "@/db/schema";
import type { RolUsuario } from "@/db/schema/enums";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora
const VERIFICACION_TOKEN_TTL_MS = 48 * 60 * 60 * 1000; // 48 horas

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export type UsuarioAlmacenado = {
  id: string;
  nombre: string;
  email: string;
  passwordHash: string | null;
  dni: string | null;
  telefono: string | null;
  rol: RolUsuario;
  imagen: string | null;
  emailVerificado: boolean;
  sessionVersion: number;
  totpHabilitado: boolean;
  createdAt: string;
};

function aUsuarioAlmacenado(u: typeof usuarios.$inferSelect): UsuarioAlmacenado {
  return {
    id: u.id,
    nombre: u.nombre,
    email: u.email,
    passwordHash: u.passwordHash,
    dni: u.dni,
    telefono: u.telefono,
    rol: u.rol,
    imagen: u.imagen,
    emailVerificado: u.emailVerificado,
    sessionVersion: u.sessionVersion,
    totpHabilitado: u.totpHabilitado,
    createdAt: u.createdAt.toISOString(),
  };
}

export async function getUsuarioPorEmail(email: string) {
  const [fila] = await db
    .select()
    .from(usuarios)
    .where(eq(usuarios.email, email.trim().toLowerCase()))
    .limit(1);
  return fila ? aUsuarioAlmacenado(fila) : null;
}

export async function getUsuarioPorId(id: string) {
  const [fila] = await db.select().from(usuarios).where(eq(usuarios.id, id)).limit(1);
  return fila ? aUsuarioAlmacenado(fila) : null;
}

export async function crearUsuario(input: {
  nombre: string;
  email: string;
  password?: string;
  imagen?: string | null;
}) {
  const existente = await getUsuarioPorEmail(input.email);
  if (existente) throw new Error("Ya existe una cuenta con ese correo.");

  const [fila] = await db
    .insert(usuarios)
    .values({
      nombre: input.nombre,
      email: input.email.trim().toLowerCase(),
      passwordHash: input.password ? await bcrypt.hash(input.password, 10) : null,
      rol: "cliente",
      imagen: input.imagen ?? null,
    })
    .returning();
  return aUsuarioAlmacenado(fila);
}

export async function verificarCredenciales(email: string, password: string) {
  const usuario = await getUsuarioPorEmail(email);
  if (!usuario?.passwordHash) return null;
  const valido = await bcrypt.compare(password, usuario.passwordHash);
  return valido ? usuario : null;
}

/** Usado por el login con Google: crea el usuario en el primer ingreso. */
export async function obtenerOCrearUsuarioOAuth(input: {
  nombre: string;
  email: string;
  imagen?: string | null;
}) {
  const existente = await getUsuarioPorEmail(input.email);
  if (existente) return existente;

  const [fila] = await db
    .insert(usuarios)
    .values({
      nombre: input.nombre,
      email: input.email.trim().toLowerCase(),
      passwordHash: null,
      rol: "cliente",
      imagen: input.imagen ?? null,
      // Google ya confirmó que el usuario controla este correo.
      emailVerificado: true,
    })
    .returning();
  return aUsuarioAlmacenado(fila);
}

/** Genera un token de recuperación (válido 1 hora, un solo uso). Devuelve
 * `null` si el correo no existe — el caller siempre debe mostrar el mismo
 * mensaje genérico en ambos casos para no revelar qué correos están
 * registrados. */
export async function crearTokenResetPassword(email: string) {
  const usuario = await getUsuarioPorEmail(email);
  if (!usuario) return null;

  const token = crypto.randomBytes(32).toString("hex");
  await db.insert(passwordResetTokens).values({
    usuarioId: usuario.id,
    token: hashToken(token),
    expiraEn: new Date(Date.now() + RESET_TOKEN_TTL_MS),
  });

  return { token, nombre: usuario.nombre };
}

/** Solo lectura, para decidir si la página de reset muestra el formulario
 * o un mensaje de "enlace inválido/expirado" — la validación real y
 * atómica ocurre en restablecerPasswordConToken. */
export async function tokenResetEsValido(token: string) {
  const [fila] = await db
    .select({ expiraEn: passwordResetTokens.expiraEn, usadoEn: passwordResetTokens.usadoEn })
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.token, hashToken(token)))
    .limit(1);
  if (!fila || fila.usadoEn) return false;
  return fila.expiraEn.getTime() > Date.now();
}

export async function restablecerPasswordConToken(token: string, nuevaPassword: string) {
  const tokenHash = hashToken(token);
  await db.transaction(async (tx) => {
    const [fila] = await tx
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, tokenHash))
      .limit(1);

    if (!fila || fila.usadoEn || fila.expiraEn.getTime() < Date.now()) {
      throw new Error("El enlace de recuperación no es válido o ya expiró.");
    }

    const passwordHash = await bcrypt.hash(nuevaPassword, 10);
    // sessionVersion + 1: cualquier sesión que ya estuviera abierta (ej. un
    // dispositivo robado que motivó el reset) deja de ser válida — ver el
    // callback jwt en src/auth.ts, que compara esto en cada request.
    await tx
      .update(usuarios)
      .set({ passwordHash, sessionVersion: sql`${usuarios.sessionVersion} + 1` })
      .where(eq(usuarios.id, fila.usuarioId));
    await tx
      .update(passwordResetTokens)
      .set({ usadoEn: new Date() })
      .where(eq(passwordResetTokens.id, fila.id));
  });
}

/** Para el callback `jwt` de NextAuth (ver src/auth.ts): solo la versión,
 * no el usuario completo, para que el chequeo en cada request sea barato. */
export async function getSessionVersion(usuarioId: string): Promise<number | null> {
  const [fila] = await db
    .select({ sessionVersion: usuarios.sessionVersion })
    .from(usuarios)
    .where(eq(usuarios.id, usuarioId))
    .limit(1);
  return fila?.sessionVersion ?? null;
}

/** Genera un token de verificación de correo (válido 48h, un solo uso). */
export async function crearTokenVerificacionEmail(usuarioId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  await db.insert(emailVerificationTokens).values({
    usuarioId,
    token: hashToken(token),
    expiraEn: new Date(Date.now() + VERIFICACION_TOKEN_TTL_MS),
  });
  return token;
}

export async function verificarEmailConToken(token: string) {
  const tokenHash = hashToken(token);
  await db.transaction(async (tx) => {
    const [fila] = await tx
      .select()
      .from(emailVerificationTokens)
      .where(eq(emailVerificationTokens.token, tokenHash))
      .limit(1);

    if (!fila || fila.usadoEn || fila.expiraEn.getTime() < Date.now()) {
      throw new Error("El enlace de verificación no es válido o ya expiró.");
    }

    await tx.update(usuarios).set({ emailVerificado: true }).where(eq(usuarios.id, fila.usuarioId));
    await tx
      .update(emailVerificationTokens)
      .set({ usadoEn: new Date() })
      .where(eq(emailVerificationTokens.id, fila.id));
  });
}

export async function actualizarUsuario(
  id: string,
  input: Partial<Pick<UsuarioAlmacenado, "nombre" | "dni" | "telefono" | "imagen">>,
) {
  const [fila] = await db.update(usuarios).set(input).where(eq(usuarios.id, id)).returning();
  if (!fila) throw new Error("Usuario no encontrado");
  return aUsuarioAlmacenado(fila);
}

/**
 * Derecho de cancelación (ARCO, Ley N° 29733 — Protección de Datos
 * Personales del Perú): borra la cuenta y todo lo que cuelga de ella con
 * onDelete "cascade" (direcciones, carrito, wishlist, reseñas). Los
 * pedidos NO se borran ni se tocan sus datos de facturación — son
 * registros contables que hay que conservar, y ya guardan su propia
 * copia de nombre/documento/email/teléfono del comprador al momento de
 * la compra (ver guardarPedido), así que desvincular el usuarioId no les
 * quita nada. pedidos y cupon_usos no tienen onDelete definido (default
 * RESTRICT), así que hay que desvincularlos a mano antes del DELETE o la
 * transacción entera falla por violar la foreign key.
 */
export async function eliminarUsuario(id: string) {
  await db.transaction(async (tx) => {
    await tx.update(pedidos).set({ usuarioId: null }).where(eq(pedidos.usuarioId, id));
    await tx.update(cuponUsos).set({ usuarioId: null }).where(eq(cuponUsos.usuarioId, id));
    await tx.delete(usuarios).where(eq(usuarios.id, id));
  });
}

// ---------- 2FA (TOTP) ----------

/** Usado por `authorize` en src/auth.ts para decidir si pedir el código
 * de la segunda etapa del login. */
export async function getTotpPorUsuarioId(usuarioId: string) {
  const [fila] = await db
    .select({ totpSecret: usuarios.totpSecret, totpHabilitado: usuarios.totpHabilitado })
    .from(usuarios)
    .where(eq(usuarios.id, usuarioId))
    .limit(1);
  return fila ?? null;
}

/** Guarda el secreto solo después de confirmar un código válido (ver
 * activarTotpAction) — así nunca queda 2FA "a medias" con un secreto que
 * el usuario nunca terminó de confirmar con su app de autenticación. */
export async function activarTotp(usuarioId: string, secret: string) {
  await db.update(usuarios).set({ totpSecret: secret, totpHabilitado: true }).where(eq(usuarios.id, usuarioId));
}

export async function desactivarTotp(usuarioId: string) {
  await db
    .update(usuarios)
    .set({ totpSecret: null, totpHabilitado: false })
    .where(eq(usuarios.id, usuarioId));
}
