export const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1"
).replace(/\/$/, "");
export class ApiError extends Error {
  status: number;
  details: string[];
  retryAfter?: number;
  constructor(
    status: number,
    message: string,
    details: string[] = [],
    retryAfter?: number,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
    this.retryAfter = retryAfter;
  }
}
export async function readResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    let retryAfter: number | undefined;
    const retryHeader = response.headers.get("Retry-After");
    if (retryHeader) {
      retryAfter = parseInt(retryHeader, 10);
      if (isNaN(retryAfter)) {
        const date = new Date(retryHeader);
        if (!isNaN(date.getTime())) {
          retryAfter = Math.max(
            0,
            Math.ceil((date.getTime() - Date.now()) / 1000),
          );
        } else {
          retryAfter = undefined;
        }
      }
    }
    throw new ApiError(
      response.status,
      error?.message || "İstek tamamlanamadı.",
      error?.details || [],
      retryAfter,
    );
  }
  // DELETE ve kayıt gibi boş yanıtlar JSON olarak ayrıştırılamaz.
  const text = response.status === 204 ? "" : await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
export async function authPost<T>(path: string, body?: unknown): Promise<T> {
  // CSRF tokenı HttpOnly cookie'den okunmaz; JSON endpointinden alınır.
  const csrf = await readResponse<{ headerName: string; token: string }>(
    await fetch(API_BASE + "/auth/csrf", {
      credentials: "include",
      cache: "no-store",
    }),
  );
  return readResponse<T>(
    await fetch(API_BASE + "/auth/" + path, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        [csrf.headerName]: csrf.token,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );
}
