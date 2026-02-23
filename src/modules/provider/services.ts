/**
 * Provider management module API service.
 */

import { hasBackend, apiRequest } from "@/services/api";
import type { ProviderProfile, RegisterProviderInput } from "./types";

export async function registerProvider(input: RegisterProviderInput): Promise<{ id: string }> {
  if (!hasBackend()) return { id: `mock-${Date.now()}` };
  return apiRequest<{ id: string }>("/api/providers/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getMyProviderProfile(): Promise<ProviderProfile | null> {
  if (!hasBackend()) return null;
  return apiRequest<ProviderProfile>("/api/providers/me");
}

export async function getProviders(filters?: { type?: string }): Promise<ProviderProfile[]> {
  if (!hasBackend()) return [];
  const q = filters?.type ? `?type=${filters.type}` : "";
  return apiRequest<ProviderProfile[]>(`/api/providers${q}`);
}
