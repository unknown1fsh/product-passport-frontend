import { api } from "../../shared/api/client";
import type { PageResponse } from "../../shared/types";

export interface Supplier {
  publicId: string;
  code: string;
  name: string;
  description?: string;
  email: string;
  phone?: string;
  contactName?: string;
  active: boolean;
  createdAt?: string;
}

export type SupplierCreateRequest = {
  code: string;
  name: string;
  email: string;
  description?: string;
  phone?: string;
  contactName?: string;
};

export type SupplierUpdateRequest = Omit<
  SupplierCreateRequest,
  "code" | "description" | "phone" | "contactName"
> & {
  active: boolean;
  description?: string | null;
  phone?: string | null;
  contactName?: string | null;
};

export const supplierApi = {
  list: async (query: string): Promise<PageResponse<Supplier>> => {
    return api<PageResponse<Supplier>>("/product-suppliers?" + query);
  },
  create: async (data: SupplierCreateRequest) => {
    return api("/product-suppliers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update: async (publicId: string, data: SupplierUpdateRequest) => {
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