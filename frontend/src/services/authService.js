import { apiRequest } from "./apiClient";

export async function login(email, password) {
  const data = await apiRequest("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });

  if (!data.user) {
    throw new Error("Login failed: user data was not returned.");
  }

  return data.user;
}

export async function signup({ name, email, password }) {
  return apiRequest("/api/auth/signup", {
    method: "POST",
    body: { name, email, password },
  });
}

export async function logout() {
  return apiRequest("/api/auth/logout", { method: "POST" });
}
