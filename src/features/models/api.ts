import { api } from "../../shared/api/client";

export type Model = {
  publicId: string;
  code: string;
  name: string;
  brandPublicId: string;
  brandName?: string;
  description: string | null;
  active: boolean;
};

// Yeni model oluşturma ve güncelleme için gerekli tipler
export type ModelInput = {
  code: string;
  name: string;
  brandPublicId: string;
  description?: string;
  active: boolean;
};

export const modelApi = {
    create: (input: ModelInput) =>
        api<Model>("/product-models", {
            method: "POST",
            body: JSON.stringify(input),
        }),
    update: (id: string, input: ModelInput) => 
        api<Model>("/product-models/" + id, {
            method: "PUT",
            body: JSON.stringify(input),
        }),
    remove: (id: string) => 
        api<void>("/product-models/" + id, { 
            method: "DELETE" 
        })
};
