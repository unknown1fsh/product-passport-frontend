import { useSearchParams } from "react-router-dom";
export function usePageQuery(defaultSort: string, allowed: string[]) {
  const [params, setParams] = useSearchParams();
  const parsedPage = Number(params.get("page") ?? 0);
  const parsedSize = Number(params.get("size") ?? 20);
  const page = Number.isInteger(parsedPage) ? Math.max(0, parsedPage) : 0;
  const size = [10, 20, 50, 100].includes(parsedSize) ? parsedSize : 20;
  const requestedSort = params.get("sortBy") || defaultSort;
  const sortBy = allowed.includes(requestedSort) ? requestedSort : defaultSort;
  const sortDir = params.get("sortDir") === "desc" ? "desc" : "asc";
  function update(changes: Record<string, string | number>) {
    const next = new URLSearchParams(params);
    next.set("page", String(page));
    next.set("size", String(size));
    next.set("sortBy", sortBy);
    next.set("sortDir", sortDir);
    Object.entries(changes).forEach(([key, value]) => {
      next.set(key, String(value));
    });
    setParams(next);
  }
  return {
    page,
    size,
    sortBy,
    sortDir,
    update,
    query: new URLSearchParams({
      page: String(page),
      size: String(size),
      sortBy,
      sortDir,
    }).toString(),
  };
}
