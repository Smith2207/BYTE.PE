import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { authConfig } from "./auth.config";
import {
  verificarCredenciales,
  obtenerOCrearUsuarioOAuth,
  getUsuarioPorEmail,
  getSessionVersion,
  getTotpPorUsuarioId,
} from "@/lib/usuarios/store";
import { superoLimiteDeFallos, registrarFallo } from "@/lib/seguridad/rate-limit";
import { verificarCodigoTotp } from "@/lib/seguridad/totp";

// 8 intentos fallidos por correo en 15 minutos — suficiente margen para
// que alguien se equivoque de contraseña un par de veces sin bloquearse,
// pero corta un ataque de fuerza bruta contra una cuenta puntual.
const LIMITE_LOGIN = { max: 8, ventanaMs: 15 * 60 * 1000 };

/**
 * Config completa (Node.js runtime): solo se usa en el route handler de
 * /api/auth y en Server Components/Actions. El middleware usa la config
 * "edge-safe" de auth.config.ts.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
        codigo2fa: { label: "Código de verificación", type: "text" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        const codigo2fa = (credentials?.codigo2fa as string | undefined)?.trim();
        if (!email || !password) return null;

        const clave = `login:${email.trim().toLowerCase()}`;
        if (await superoLimiteDeFallos(clave, LIMITE_LOGIN)) return null;

        const usuario = await verificarCredenciales(email, password);
        if (!usuario) {
          await registrarFallo(clave);
          return null;
        }

        if (usuario.totpHabilitado) {
          // El cliente decide si mostrar el campo de código con una
          // consulta aparte (ver requiereCodigoTotpAction en
          // login-actions.ts) — signIn() no deja llegar al cliente el
          // motivo real de un error de Credentials, así que acá alcanza
          // con rechazar sin código igual que un código inválido.
          if (!codigo2fa) return null;
          const totp = await getTotpPorUsuarioId(usuario.id);
          const valido = totp?.totpSecret ? verificarCodigoTotp(totp.totpSecret, codigo2fa) : false;
          if (!valido) {
            await registrarFallo(clave);
            return null;
          }
        }

        return {
          id: usuario.id,
          name: usuario.nombre,
          email: usuario.email,
          image: usuario.imagen,
          rol: usuario.rol,
          sessionVersion: usuario.sessionVersion,
        };
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    signIn: async ({ user, account }) => {
      if (account?.provider === "google" && user.email) {
        await obtenerOCrearUsuarioOAuth({
          nombre: user.name ?? user.email,
          email: user.email,
          imagen: user.image,
        });
      }
      return true;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.rol = (user as { rol?: string }).rol;
        token.sessionVersion = (user as { sessionVersion?: number }).sessionVersion ?? 0;
      }
      if (!token.rol && token.email) {
        // Login con Google: el usuario recién se creó en el callback signIn de arriba.
        const usuario = await getUsuarioPorEmail(token.email);
        if (usuario) {
          token.rol = usuario.rol;
          token.sub = usuario.id;
          token.sessionVersion = usuario.sessionVersion;
        }
      }
      // Si la contraseña cambió después de emitir este token (ver
      // restablecerPasswordConToken), sessionVersion ya no coincide —
      // se trata la sesión como cerrada aunque el JWT no haya expirado
      // todavía. Cambiar la contraseña sin esto no sacaba a nadie que ya
      // tuviera una sesión abierta (ej. un dispositivo robado).
      if (token.sub) {
        const actual = await getSessionVersion(token.sub);
        if (actual == null || actual !== token.sessionVersion) {
          delete token.sub;
          delete token.rol;
        }
      }
      return token;
    },
  },
});
