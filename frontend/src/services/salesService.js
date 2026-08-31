import { apiRequest } from "./apiClient";

export async function fetchPartTypes() {
  return apiRequest("/api/sales/availableParts");
}

export async function fetchModels(partType, forAdd = false) {
  const query = forAdd ? "?add=true" : "";
  return apiRequest(
    `/api/sales/availableModels/${encodeURIComponent(partType)}${query}`
  );
}

export async function fetchSales() {
  const data = await apiRequest("/api/sales/mySales");
  return Array.isArray(data) ? data : data.sales || [];
}

export async function fetchAllSales() {
  const data = await apiRequest("/api/sales/allSales");
  return Array.isArray(data) ? data : data.sales || [];
}

export async function createSale({ items, paymentMethod, transactionId }) {
  return apiRequest("/api/createSale", {
    method: "POST",
    body: { saleType: "parts", items, paymentMethod, transactionId },
  });
}

export async function createBicycleSale({
  components,
  salePrice,
  paymentMethod,
  transactionId,
}) {
  return apiRequest("/api/createSale", {
    method: "POST",
    body: {
      saleType: "bicycle",
      components,
      salePrice,
      paymentMethod,
      transactionId,
    },
  });
}

export async function fetchSaleDetail(saleId) {
  return apiRequest(`/api/sales/${saleId}`);
}

export async function estimateBicyclePrice(components) {
  return apiRequest("/api/sales/estimateBicyclePrice", {
    method: "POST",
    body: { components },
  });
}

export async function verifySale(saleId) {
  return apiRequest(`/api/sales/${saleId}/verify`, {
    method: "PATCH",
  });
}