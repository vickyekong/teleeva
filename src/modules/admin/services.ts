/**
 * Admin control center module API service.
 * All endpoints require admin role on backend.
 */

import { hasBackend, apiRequest } from "@/services/api";
import type {
  ActiveRequestSummary,
  EmergencyAlertSummary,
  ProviderActivitySummary,
  SystemAnalytics,
} from "./types";

export async function getActiveRequests(): Promise<ActiveRequestSummary[]> {
  if (!hasBackend()) return [];
  return apiRequest<ActiveRequestSummary[]>("/api/admin/requests");
}

export async function getEmergencyAlerts(): Promise<EmergencyAlertSummary[]> {
  if (!hasBackend()) return [];
  return apiRequest<EmergencyAlertSummary[]>("/api/admin/emergencies");
}

export async function getProviderActivity(): Promise<ProviderActivitySummary[]> {
  if (!hasBackend()) return [];
  return apiRequest<ProviderActivitySummary[]>("/api/admin/providers");
}

export async function getAnalytics(): Promise<SystemAnalytics | null> {
  if (!hasBackend()) return null;
  return apiRequest<SystemAnalytics>("/api/admin/analytics");
}
