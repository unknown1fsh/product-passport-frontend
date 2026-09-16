import { api } from "../../shared/api/client";
import type { ServiceRecord, ServiceRecordInput } from "./types";

export const serviceRecordApi = {
  create: (input: ServiceRecordInput) =>
    api<ServiceRecord>("/service-records", {
      method: "POST",
      body: JSON.stringify(input),
    }),
};
