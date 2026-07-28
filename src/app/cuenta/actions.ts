"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  actualizarUsuario,
  eliminarUsuario,
  getUsuarioPorId,
  crearTokenVerificacionEmail,
} from "@/lib/usuarios/store";
import { listarPedidosPorUsuario } from "@/lib/pedidos/store";
import { listarDireccionesPorUsuario } from "@/lib/direcciones/store";
import { listarWishlistPorUsuario } from "@/lib/wishlist/store";
import { listarResenasDeUsuario } from "@/lib/resenas/store";
import { enviarCorreo } from "@/lib/email/client";
import { plantillaVerificarCorreo } from "@/lib/email/plantillas";
import { intentoPermitido } from "@/lib/seguridad/rate-limit";

export async function actualizarPerfilAction(input: {
  nombre: string;
  telefono: string;
  dni: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Debes iniciar sesión");

  const nombre = input.nombre.trim();
  if (!nombre) throw new Error("El nombre no puede estar vacío");

  const telefono = input.telefono.trim();
  if (telefono && !/^9\d{8}$/.test(telefono)) {
    throw new Error("El teléfono debe tener 9 dígitos y empezar con 9");
  }

  const dni = input.dni.trim();
  if (dni && !/^\d{8}$/.test(dni)) {
    throw new Error("El DNI debe tener 8 dígitos");
  }

  const usuario = await actualizarUsuario(session.user.id, {
    nombre,
    telefono: telefono || null,
    dni: dni || null,
  });
  revalidatePath("/cuenta");
  return usuario;
}

export async function actualizarAvatarAction(imagenUrl: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Debes iniciar sesión");

  const usuario = await actualizarUsuario(session.user.id, { imagen: imagenUrl });
  revalidatePath("/cuenta");
  return usuario;
}

export async function reenviarVerificacionEmailAction() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Debes iniciar sesión");

  const usuario = await getUsuarioPorId(session.user.id);
  if (!usuario) throw new Error("Usuario no encontrado");
  if (usuario.emailVerificado) return { ok: true };

  const { permitido } = await intentoPermitido(`verificar-email:${usuario.id}`, {
    max: 3,
    ventanaMs: 60 * 60 * 1000,
  });
  if (!permitido) throw new Error("Ya te enviamos varios correos. Espera un poco antes de pedir otro.");

  const token = await crearTokenVerificacionEmail(usuario.id);
  await enviarCorreo({
    para: usuario.email,
    asunto: "Confirma tu correo",
    html: plantillaVerificarCorreo(usuario.nombre, token),
  });
  return { ok: true };
}

/** Derecho de acceso (ARCO): junta todo lo que la tienda tiene guardado
 * de este usuario para que pueda descargarlo. No incluye el hash de la
 * contraseña ni tokens internos. */
export async function exportarMisDatosAction() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Debes iniciar sesión");

  const [usuario, pedidos, direcciones, wishlist, resenas] = await Promise.all([
    getUsuarioPorId(session.user.id),
    listarPedidosPorUsuario(session.user.id),
    listarDireccionesPorUsuario(session.user.id),
    listarWishlistPorUsuario(session.user.id),
    listarResenasDeUsuario(session.user.id),
  ]);
  if (!usuario) throw new Error("Usuario no encontrado");

  return {
    generadoEn: new Date().toISOString(),
    perfil: {
      nombre: usuario.nombre,
      email: usuario.email,
      dni: usuario.dni,
      telefono: usuario.telefono,
      miembroDesde: usuario.createdAt,
    },
    direcciones,
    pedidos: pedidos.map((p) => ({
      numeroPedido: p.numeroPedido,
      estado: p.estado,
      total: p.total,
      items: p.items,
      direccion: p.direccion,
      metodoPago: p.metodoPago,
      createdAt: p.createdAt,
    })),
    wishlist,
    resenas: resenas.map((r) => ({
      producto: r.productoNombre,
      calificacion: r.calificacion,
      comentario: r.comentario,
      estado: r.estado,
      createdAt: r.createdAt,
    })),
  };
}

/** Derecho de cancelación (ARCO): borra la cuenta. Los pedidos quedan
 * como registro contable pero se desvinculan de la cuenta (ver
 * eliminarUsuario) — el cliente debe cerrar la sesión inmediatamente
 * después de llamar a esto, ya que el usuarioId de su token ya no existe. */
export async function eliminarCuentaAction() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Debes iniciar sesión");

  await eliminarUsuario(session.user.id);
}
