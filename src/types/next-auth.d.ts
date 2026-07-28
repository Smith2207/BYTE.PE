import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      rol: "cliente" | "admin";
    } & DefaultSession["user"];
  }

  interface User {
    rol?: "cliente" | "admin";
    sessionVersion?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    rol?: "cliente" | "admin";
    sessionVersion?: number;
  }
}
