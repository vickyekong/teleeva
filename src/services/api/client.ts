/**
 * API client for MedConnect backend.
 * Uses NEXT_PUBLIC_API_URL when available; otherwise calls no-op / mock.
 * Do not hardcode business logic here; keep it in API or module services.
 */

const BASE_URL =
  typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : "";

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = BASE_URL ? `${BASE_URL}${path}` : path;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  // When you add auth: const token = getAuthToken(); if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message || "API error");
  }
  return res.json() as Promise<T>;
}

export function hasBackend(): boolean {
  return Boolean(BASE_URL);
}
