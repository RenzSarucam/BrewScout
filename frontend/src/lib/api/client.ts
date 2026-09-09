import { env } from "@/config/env";
import { ensureCsrfCookie, getXsrfTokenFromCookie } from "@/lib/api/csrf";
import type { ApiResponse } from "@/types/api";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export class ApiRequestError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.errors = errors;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const method = (rest.method ?? "GET").toString().toUpperCase();

  let xsrfToken = getXsrfTokenFromCookie();
  if (!SAFE_METHODS.has(method) && !xsrfToken) {
    await ensureCsrfCookie();
    xsrfToken = getXsrfTokenFromCookie();
  }

  const response = await fetch(`${env.apiUrl}${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload || payload.success === false) {
    const message = payload && "message" in payload ? payload.message : "Something went wrong. Please try again.";
    const errors = payload && "errors" in payload ? payload.errors : undefined;
    throw new ApiRequestError(message, response.status, errors);
  }

  return payload.data;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "DELETE" }),
};
