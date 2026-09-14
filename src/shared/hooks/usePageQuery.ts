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
    setParams({
      page: String(page),
      size: String(size),
      sortBy,
      sortDir,
      ...Object.fromEntries(
        Object.entries(changes).map(([key, value]) => [key, String(value)]),
      ),
    });
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
