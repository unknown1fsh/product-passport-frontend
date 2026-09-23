import { sessionStore } from "../../features/auth/session";
import { API_BASE, ApiError, readResponse } from "./http";
import type { ApiResponse } from "../types";

let cachedCsrf: { headerName: string; token: string } | null = null;

async function getCsrfToken(): Promise<{ headerName: string; token: string }> {
  if (cachedCsrf) return cachedCsrf;
  try {
    cachedCsrf = await readResponse<{ headerName: string; token: string }>(
      await fetch(API_BASE + "/auth/csrf", {
        credentials: "include",
        cache: "no-store",
      }),
    );
    return cachedCsrf;
  } catch {
    return { headerName: "X-XSRF-TOKEN", token: "" };
  }
}

// Token henüz yüklenmediyse kısa süre bekle
async function ensureToken(): Promise<string> {
  let token = sessionStore.getToken();
  if (token) return token;
  
  try {
    await sessionStore.initialize();
    token = sessionStore.getToken();
  } catch {
    // yoksay
  }
  
  if (!token) {
    throw new ApiError(401, "Giriş yapın.");
  }
  return token;
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const send = async (token: string) => {
    const isMutation = options.method && ["POST", "PUT", "DELETE", "PATCH"].includes(options.method.toUpperCase());
    const csrf = isMutation ? await getCsrfToken() : null;

    return fetch(API_BASE + path, {
      ...options,
      credentials: "include",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(csrf ? { [csrf.headerName]: csrf.token } : {}),
        ...options.headers,
        Authorization: "Bearer " + token,
      },
    });
  };

  const token = await ensureToken();
  let response = await send(token);

  if (response.status === 401) {
    if (options.signal?.aborted)
      throw new DOMException("İstek iptal edildi", "AbortError");
    const fresh = await sessionStore.refresh(token);
    response = await send(fresh);
    if (response.status === 401) sessionStore.expire();
  }

  const envelope = await readResponse<ApiResponse<T> | undefined>(response);
  return envelope?.data as T;
}