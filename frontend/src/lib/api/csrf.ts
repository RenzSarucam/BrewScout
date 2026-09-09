import { env } from "@/config/env";

function getApiRootUrl(): string {
  return env.apiUrl.replace(/\/api\/?$/, "");
}

export async function ensureCsrfCookie(): Promise<void> {
  await fetch(`${getApiRootUrl()}/sanctum/csrf-cookie`, {
    credentials: "include",
  });
}

export function getXsrfTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}