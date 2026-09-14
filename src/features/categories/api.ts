import { api } from "../../shared/api/client";
import type {
  Category,
  CategoryInput,
  CategoryUpdate,
} from "../../shared/types";
export const categoryApi = {
  create: (input: CategoryInput) =>
    api<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  update: (id: string, input: CategoryUpdate) =>
    api<Category>("/categories/" + id, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  remove: (id: string) => api<void>("/categories/" + id, { method: "DELETE" }),
};
