import { api } from "../../shared/api/client";
import type {
  ServiceRecord,
  ServiceRecordInput,
  ServiceRecordUpdate,
} from "./types";

export const serviceRecordApi = {
  create: (input: ServiceRecordInput) =>
    api<ServiceRecord>("/service-records", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (id: string, input: ServiceRecordUpdate) =>
    api<ServiceRecord>("/service-records/" + id, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  remove: (id: string) =>
    api<void>("/service-records/" + id, {
      method: "DELETE",
    }),
};
