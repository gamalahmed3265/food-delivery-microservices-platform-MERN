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

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const authApi = {
  login: (data: LoginData) => apiClient.post("/auth/login", data),
  register: (data: RegisterData) => apiClient.post("/auth/register", data),
  verifyEmail: (token: string) => apiClient.get(`/auth/verify-email?token=${token}`),
  resendVerification: (email: string) => apiClient.post("/auth/resend-verification", { email }),
  forgotPassword: (email: string) => apiClient.post("/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string) => apiClient.post(`/auth/reset-password?token=${token}`, { password }),
  changePassword: (data: ChangePasswordData) => apiClient.post("/auth/change-password", data),
  getMe: () => apiClient.get("/users/me"),
  logout: () => apiClient.post("/auth/logout"),
};