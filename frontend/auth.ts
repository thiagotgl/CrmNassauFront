import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

type BackendLoginResponse = {
  message?: string;
  token?: string;
  access_token?: string;
  user?: {
    id?: string | number;
    name?: string;
    email?: string;
    tipo?: string;
  };
  data?: {
    token?: string;
    access_token?: string;
    user?: {
      id?: string | number;
      name?: string;
      email?: string;
      tipo?: string;
    };
  };
};

function getTipoFromAccessToken(accessToken?: unknown) {
  if (typeof accessToken !== "string") {
    return undefined;
  }

  const [, payload] = accessToken.split(".");

  if (!payload) {
    return undefined;
  }

  try {
    const normalizedPayload = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const decodedPayload = Buffer.from(normalizedPayload, "base64").toString(
      "utf8",
    );
    const data = JSON.parse(decodedPayload) as { tipo?: unknown };

    return typeof data.tipo === "string" ? data.tipo : undefined;
  } catch {
    return undefined;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "E-mail", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const senha = credentials?.senha;

        if (typeof email !== "string" || typeof senha !== "string") {
          return null;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
          throw new Error("NEXT_PUBLIC_API_URL não configurada.");
        }

        const response = await fetch(`${apiUrl}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, senha }),
        });

        const data = (await response.json()) as BackendLoginResponse;

        if (!response.ok) {
          throw new Error(data.message || "Credenciais inválidas.");
        }

        const accessToken =
          data.token ??
          data.access_token ??
          data.data?.token ??
          data.data?.access_token;

        if (!accessToken) {
          throw new Error("A API não retornou um token JWT.");
        }

        const user = data.user ?? data.data?.user;

        return {
          id: String(user?.id ?? email),
          name: user?.name ?? email,
          email: user?.email ?? email,
          tipo: user?.tipo,
          accessToken,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.tipo = user.tipo ?? getTipoFromAccessToken(user.accessToken);
      } else if (!token.tipo) {
        token.tipo = getTipoFromAccessToken(token.accessToken);
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.sub === "string") {
        session.user.id = token.sub;
      }

      if (typeof token.accessToken === "string") {
        session.accessToken = token.accessToken;
      }

      if (session.user && typeof token.tipo === "string") {
        session.user.tipo = token.tipo;
      }

      return session;
    },
  },
};
