import { api } from "../../shared/api/client";
import type { PageResponse } from "../../shared/types";

export interface Supplier {
  publicId: string;
  code: string;
  name: string;
  description?: string;
  email: string;
  phone?: string;
  active: boolean;
  createdAt?: string;
}

export const supplierApi = {
  list: async (query: string): Promise<PageResponse<Supplier>> => {
    return api<PageResponse<Supplier>>("/product-suppliers?" + query);
  },
  create: async (data: Partial<Supplier>) => {
    return api("/product-suppliers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update: async (publicId: string, data: Partial<Supplier>) => {
    return api("/product-suppliers/" + publicId, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  remove: async (publicId: string) => {
    return api("/product-suppliers/" + publicId, {
      method: "DELETE",
    });
  },
};