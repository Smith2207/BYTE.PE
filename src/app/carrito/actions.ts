"use server";

import { cookies } from "next/headers";
import { auth } from "@/auth";
import {
  cerrarCarritoPorSession,
  cerrarCarritoPorUsuario,
  fusionarCarritoInvitadoConUsuario,
  obtenerOCrearCarrito,
  reemplazarItemsCarrito,
  type CarritoItemInput,
} from "@/lib/carrito/store";

const COOKIE_SESION_CARRITO = "carrito_session_id";
const MAX_AGE_COOKIE_SEGUNDOS = 60 * 60 * 24 * 180; // 180 días

async function obtenerSessionIdInvitado(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(COOKIE_SESION_CARRITO)?.value;
}

async function garantizarSessionIdInvitado(): Promise<string> {
  const store = await cookies();
  const existente = store.get(COOKIE_SESION_CARRITO)?.value;
  if (existente) return existente;

  const nuevo = crypto.randomUUID();
  store.set(COOKIE_SESION_CARRITO, nuevo, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE_COOKIE_SEGUNDOS,
    path: "/",
  });
  return nuevo;
}

/** Sincroniza el carrito local (localStorage) a BD. Si el usuario está
 * logueado y todavía carga una cookie de invitado con carrito propio, la
 * fusiona primero. Best-effort: cualquier error se registra y no debe
 * bloquear la experiencia de compra en el navegador. */
export async function sincronizarCarritoAction(items: CarritoItemInput[]): Promise<void> {
  try {
    const session = await auth();
    const usuarioId = session?.user?.id;

    let carritoId: string;
    if (usuarioId) {
      const sessionIdInvitado = await obtenerSessionIdInvitado();
      if (sessionIdInvitado) {
        await fusionarCarritoInvitadoConUsuario(sessionIdInvitado, usuarioId);
        const store = await cookies();
        store.delete(COOKIE_SESION_CARRITO);
      }
      carritoId = await obtenerOCrearCarrito({ usuarioId });
    } else {
      const sessionId = await garantizarSessionIdInvitado();
      carritoId = await obtenerOCrearCarrito({ sessionId });
    }

    await reemplazarItemsCarrito(carritoId, items);
  } catch (error) {
    console.error("[carrito] Error sincronizando carrito a BD:", error);
  }
}

export async function cerrarCarritoAction(): Promise<void> {
  try {
    const session = await auth();
    const usuarioId = session?.user?.id;
    if (usuarioId) {
      await cerrarCarritoPorUsuario(usuarioId);
    }
    const sessionId = await obtenerSessionIdInvitado();
    if (sessionId) {
      await cerrarCarritoPorSession(sessionId);
      const store = await cookies();
      store.delete(COOKIE_SESION_CARRITO);
    }
  } catch (error) {
    console.error("[carrito] Error cerrando carrito en BD:", error);
  }
}
