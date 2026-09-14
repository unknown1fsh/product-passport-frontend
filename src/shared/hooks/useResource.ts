import { useEffect, useState } from "react";
import { api } from "../api/client";
export function useResource<T>(path: string) {
  const [state, setState] = useState<{
    path: string;
    data?: T;
    error?: unknown;
    loading: boolean;
  }>({ path, loading: true });
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    void api<T>(path, { signal: controller.signal }).then(
      (data) => {
        if (!controller.signal.aborted)
          setState({ path, data, loading: false });
      },
      (error) => {
        if (!controller.signal.aborted)
          setState({ path, error, loading: false });
      },
    );
    return () => controller.abort();
  }, [path, version]);
  return {
    ...(state.path === path
      ? state
      : { loading: true, data: undefined, error: undefined }),
    reload: () => {
      setState({ path, loading: true });
      setVersion((n) => n + 1);
    },
  };
}
