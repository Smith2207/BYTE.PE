import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { usuarios, passwordResetTokens } from "@/db/schema";
import type { RolUsuario } from "@/db/schema/enums";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

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
    await tx.update(usuarios).set({ passwordHash }).where(eq(usuarios.id, fila.usuarioId));
    await tx
      .update(passwordResetTokens)
      .set({ usadoEn: new Date() })
      .where(eq(passwordResetTokens.id, fila.id));
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
