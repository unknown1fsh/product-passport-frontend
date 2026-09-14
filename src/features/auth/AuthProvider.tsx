import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";
import { sessionStore } from "./session";
type Auth = ReturnType<typeof sessionStore.getSnapshot>;
const AuthContext = createContext<Auth | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
  const session = useSyncExternalStore(
    sessionStore.subscribe,
    sessionStore.getSnapshot,
  );
  useEffect(() => {
    void sessionStore.initialize();
  }, []);
  return (
    <AuthContext.Provider value={session}>{children}</AuthContext.Provider>
  );
}
export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("AuthProvider gerekli.");
  return auth;
}
