import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { usuarios } from "@/db/schema";
import type { RolUsuario } from "@/db/schema/enums";

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

export async function actualizarUsuario(
  id: string,
  input: Partial<Pick<UsuarioAlmacenado, "nombre" | "dni" | "telefono">>,
) {
  const [fila] = await db.update(usuarios).set(input).where(eq(usuarios.id, id)).returning();
  if (!fila) throw new Error("Usuario no encontrado");
  return aUsuarioAlmacenado(fila);
}
