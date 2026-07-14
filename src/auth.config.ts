import type { NextAuthConfig } from "next-auth";

/**
 * Config "edge-safe": sin providers ni nada que dependa de Node
 * (bcrypt/fs). El middleware corre en Edge runtime y solo necesita
 * decodificar el JWT ya firmado, no re-ejecutar el login. La config
 * completa (con Credentials/Google) vive en src/auth.ts y solo se usa
 * en el route handler y en Server Components/Actions (Node.js runtime).
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  // Necesario fuera de plataformas que ya inyectan el host de confianza
  // (ej. Vercel) — sin esto, NextAuth rechaza el Host header en producción.
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.rol = token.rol as "cliente" | "admin";
      }
      return session;
    },
  },
};
