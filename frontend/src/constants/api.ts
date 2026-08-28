function resolveApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
  const trimmed = raw.replace(/\/$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

export const API_BASE_URL = resolveApiBaseUrl();

export const AUTH_TOKEN_KEY = "keystone_token";
export const AUTH_USER_KEY = "keystone_user";
