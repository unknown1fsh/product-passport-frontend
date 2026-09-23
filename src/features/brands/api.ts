import { api } from "../../shared/api/client";
import type { PageResponse } from "../../shared/types";

export interface Brand {
  publicId: string;
  name: string;
  description?: string; // Bu satırı ekliyoruz
  active: boolean;
  createdAt?: string;
}

export const brandApi = {
  list: async (query: string): Promise<PageResponse<Brand>> => {
    return api<PageResponse<Brand>>("/product-brands?" + query);
  },
  create: async (data: Partial<Brand>) => {
    return api("/product-brands", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update: async (publicId: string, data: Partial<Brand>) => {
    return api("/product-brands/" + publicId, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  remove: async (publicId: string) => {
    return api("/product-brands/" + publicId, {
      method: "DELETE",
    });
  },
};