import { apiClient } from "./client";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  image?: string;
}

export const authApi = {
  login: (data: LoginData) => apiClient.post("/auth/login", data),
  register: (data: RegisterData) => apiClient.post("/auth/register", data),
  getMe: () => apiClient.get("/users/me"),
  logout: () => apiClient.post("/auth/logout"),
};