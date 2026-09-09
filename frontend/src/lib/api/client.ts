import { env } from "@/config/env";
import { ensureCsrfCookie, getXsrfTokenFromCookie } from "@/lib/api/csrf";
import type { ApiResponse } from "@/types/api";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// Plain fetch() never times out on its own — a request can hang forever if
// nothing responds (backend down, blocked by the network, etc). Give every
// call a hard ceiling so callers always get a resolved/rejected promise.
const DEFAULT_TIMEOUT_MS = 15000;

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

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), DEFAULT_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${env.apiUrl}${path}`, {
      ...rest,
      signal: rest.signal ?? timeoutController.signal,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiRequestError("The request timed out. Please check your connection and try again.", 0);
    }
    throw new ApiRequestError("Network error. Please check your connection and try again.", 0);
  } finally {
    clearTimeout(timeoutId);
  }

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
