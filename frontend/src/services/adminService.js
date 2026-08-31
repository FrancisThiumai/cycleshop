import { apiRequest } from "./apiClient";

export async function fetchResources() {
  return apiRequest("/api/admin/resources");
}

export async function fetchRows(resource) {
  return apiRequest(`/api/admin/${resource}`);
}

export async function createRow(resource, payload) {
  return apiRequest(`/api/admin/${resource}`, { method: "POST", body: payload });
}

export async function deleteRow(resource, id) {
  return apiRequest(`/api/admin/${resource}/${id}`, { method: "DELETE" });
}
