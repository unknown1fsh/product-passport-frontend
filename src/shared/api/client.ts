import { sessionStore } from "../../features/auth/session";
import { API_BASE, ApiError, readResponse } from "./http";
import type { ApiResponse } from "../types";
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const send = (token: string) =>
    fetch(API_BASE + path, {
      ...options,
      credentials: "omit",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
        Authorization: "Bearer " + token,
      },
    });
  const token = sessionStore.getToken();
  if (!token) throw new ApiError(401, "Giriş yapın.");
  let response = await send(token);
  // Sadece 401 yenilenir. 403/409 ve ağ hataları otomatik tekrarlanmaz.
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
