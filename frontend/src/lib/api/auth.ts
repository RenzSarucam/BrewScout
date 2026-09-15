import { apiClient } from "@/lib/api/client";
import type {
  ForgotPasswordValues,
  LoginValues,
  RegisterValues,
  ResetPasswordValues,
  UpdatePasswordValues,
  UpdateProfileValues,
} from "@/lib/validation/auth";
import type { User } from "@/types/user";

export function fetchCurrentUser() {
  return apiClient.get<User>("/v1/auth/me");
}

export function login(values: LoginValues) {
  return apiClient.post<User>("/v1/auth/login", values);
}

export function register(values: RegisterValues) {
  return apiClient.post<User>("/v1/auth/register", values);
}

export function logout() {
  return apiClient.post<null>("/v1/auth/logout");
}

export function updateProfile(values: UpdateProfileValues) {
  return apiClient.put<User>("/v1/auth/me", values);
}

export function updatePassword(values: UpdatePasswordValues) {
  return apiClient.put<null>("/v1/auth/me/password", values);
}

export function forgotPassword(values: ForgotPasswordValues) {
  return apiClient.post<{ message: string }>("/v1/auth/forgot-password", values);
}

export function resetPassword(values: ResetPasswordValues) {
  return apiClient.post<{ message: string }>("/v1/auth/reset-password", values);
}