import { api } from "../../shared/api/client";
import type { PageResponse } from "../../shared/types";

export type Model = {
  publicId: string;
  code: string;
  name: string;
  brandPublicId: string;
  brandName?: string;
  description: string | null;
  active: boolean;
};

export const modelApi = {
  // Listeleme işlemi doğrudan useResource kancası ile yapılacak, 
  // ama ileride CRUD işlemleri buraya eklenecek.
};