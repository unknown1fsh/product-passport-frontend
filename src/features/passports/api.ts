import {api} from "../../shared/api/client";

import type {Passport, PassportInput, PassportUpdate} from "../../shared/types";

export const passportApi = {
    create: (input: PassportInput) =>
        api<Passport>("/product-passports", {
            method: "POST",
            body: JSON.stringify(input),
        }),
    update: (id: string, input: PassportUpdate) => api<Passport>("/product-passports/" + id, {
        method: "PUT",
        body: JSON.stringify(input),
    }),
}
