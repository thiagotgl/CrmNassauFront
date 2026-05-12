"use client";

import { signOut } from "next-auth/react";

type AuthFetchOptions = RequestInit & {
  accessToken?: string;
};

export function getAuthHeaders(accessToken?: string) {
  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

export async function authFetch(input: RequestInfo | URL, init?: AuthFetchOptions) {
  const { accessToken, headers, ...requestInit } = init ?? {};
  const response = await fetch(input, {
    ...requestInit,
    headers: {
      ...getAuthHeaders(accessToken),
      ...headers,
    },
  });

  if (response.status === 401) {
    const data = (await response.clone().json().catch(() => null)) as
      | { error?: string; message?: string }
      | null;
    const message = data?.error || data?.message || "";
    const normalizedMessage = message.toLowerCase();

    if (
      normalizedMessage.includes("token invalido") ||
      normalizedMessage.includes("token nao informado") ||
      normalizedMessage.includes("token não informado")
    ) {
      await signOut({ callbackUrl: "/" });
    }
  }

  return response;
}
