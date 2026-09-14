import { ApiError, authPost } from "../../shared/api/http";
import type { Session, User } from "../../shared/types";

type Snapshot = {
  status: "loading" | "authenticated" | "anonymous";
  user: User | null;
  notice: string | null;
};
type Message =
  | { type: "session"; session: Session }
  | { type: "clear"; notice: string | null };
const LOCK = "product-passport-auth";
const coordinated =
  typeof navigator !== "undefined" &&
  !!navigator.locks &&
  typeof BroadcastChannel !== "undefined";
const channel = coordinated ? new BroadcastChannel(LOCK) : null;
let token: string | null = null;
let snapshot: Snapshot = { status: "loading", user: null, notice: null };
let refreshPromise: Promise<string> | null = null;
let initializePromise: Promise<void> | null = null;
let revision = 0;
const listeners = new Set<() => void>();
function emit(next: Snapshot) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}
function accept(session: Session, broadcast = true) {
  revision++;
  token = session.accessToken;
  emit({ status: "authenticated", user: session.user, notice: null });
  if (broadcast)
    channel?.postMessage({ type: "session", session } satisfies Message);
}
function clear(notice: string | null, broadcast = true) {
  revision++;
  token = null;
  emit({ status: "anonymous", user: null, notice });
  if (broadcast)
    channel?.postMessage({ type: "clear", notice } satisfies Message);
}
if (channel)
  channel.onmessage = (event: MessageEvent<Message>) => {
    if (event.data.type === "session") accept(event.data.session, false);
    if (event.data.type === "clear") clear(event.data.notice, false);
  };
// Login/logout da aynı kilidi kullanır: refresh devam ederken cookie değişmez.
// Mesajlar yalnızca aynı origin'deki sekmelerin belleğine gider; depolama kullanılmaz.
function locked<T>(operation: () => Promise<T>): Promise<T> {
  return coordinated ? navigator.locks.request(LOCK, operation) : operation();
}
export const sessionStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => snapshot,
  getToken: () => token,
  async initialize() {
    if (!initializePromise)
      initializePromise = (async () => {
        if (!coordinated) {
          clear(
            "Bu tarayıcıda otomatik oturum yenileme desteklenmiyor. Giriş yapın.",
            false,
          );
          return;
        }
        try {
          await sessionStore.refresh(null, true);
        } catch {
          /* refresh görünür durumu belirler */
        }
      })();
    return initializePromise;
  },
  async login(email: string, password: string) {
    await locked(async () => {
      const session = await authPost<Session>("login", { email, password });
      accept(session);
    });
  },
  refresh(rejectedToken: string | null, startup = false): Promise<string> {
    if (token && token !== rejectedToken) return Promise.resolve(token);
    if (refreshPromise) return refreshPromise;
    if (!coordinated) {
      clear("Oturumunuz sona erdi. Tekrar giriş yapın.");
      return Promise.reject(new ApiError(401, "Tekrar giriş yapın."));
    }
    const requestedRevision = revision;
    refreshPromise = locked(async () => {
      // Kilit beklenirken diğer sekme oturumu kapattıysa yeniden açma.
      if (revision !== requestedRevision && !token)
        throw new ApiError(401, "Oturum kapatıldı.");
      if (token && token !== rejectedToken) return token;
      const startedRevision = revision;
      try {
        const session = await authPost<Session>("refresh");
        if (revision !== startedRevision) {
          if (token) return token;
          throw new ApiError(401, "Oturum kapatıldı.");
        }
        accept(session);
        return session.accessToken;
      } catch (error) {
        // Refresh cevabı kaybolmuş olabilir. Tek kullanımlık cookie ile kör tekrar yok.
        clear(
          startup && error instanceof ApiError && error.status === 401
            ? null
            : "Oturum yenilenemedi. Lütfen tekrar giriş yapın.",
        );
        throw error;
      }
    }).finally(() => {
      refreshPromise = null;
    });
    return refreshPromise;
  },
  async logout() {
    await locked(async () => {
      try {
        await authPost<void>("logout");
        clear(null);
      } catch {
        clear(
          "Sunucuya çıkış bildirilemedi. Yerel oturum temizlendi; sunucu oturumunu kapatmak için yeniden giriş yapıp çıkış yapın.",
        );
      }
    });
  },
  expire() {
    clear("Oturumunuz sona erdi. Tekrar giriş yapın.");
  },
};
