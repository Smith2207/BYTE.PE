import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { authConfig } from "./auth.config";
import {
  verificarCredenciales,
  obtenerOCrearUsuarioOAuth,
  getUsuarioPorEmail,
} from "@/lib/usuarios/store";
import { superoLimiteDeFallos, registrarFallo } from "@/lib/seguridad/rate-limit";

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
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const clave = `login:${email.trim().toLowerCase()}`;
        if (await superoLimiteDeFallos(clave, LIMITE_LOGIN)) return null;

        const usuario = await verificarCredenciales(email, password);
        if (!usuario) {
          await registrarFallo(clave);
          return null;
        }
        return {
          id: usuario.id,
          name: usuario.nombre,
          email: usuario.email,
          image: usuario.imagen,
          rol: usuario.rol,
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
      }
      if (!token.rol && token.email) {
        // Login con Google: el usuario recién se creó en el callback signIn de arriba.
        const usuario = await getUsuarioPorEmail(token.email);
        if (usuario) {
          token.rol = usuario.rol;
          token.sub = usuario.id;
        }
      }
      return token;
    },
  },
});
