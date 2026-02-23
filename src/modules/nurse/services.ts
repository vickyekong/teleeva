/**
 * Nurse module API service.
 * Integrate with maps API placeholder for location when ready.
 */

import { hasBackend, apiRequest } from "@/services/api";
import type { NurseJob, NurseEarningsSummary } from "./types";

export async function getJobs(): Promise<NurseJob[]> {
  if (!hasBackend()) return [];
  return apiRequest<NurseJob[]>("/api/nurse/jobs");
}

export async function acceptJob(id: string): Promise<void> {
  if (!hasBackend()) return;
  await apiRequest(`/api/nurse/jobs/${id}/accept`, { method: "POST" });
}

export async function updateJobStatus(
  id: string,
  status: "en_route" | "in_progress" | "completed"
): Promise<void> {
  if (!hasBackend()) return;
  await apiRequest(`/api/nurse/jobs/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function getEarnings(): Promise<NurseEarningsSummary | null> {
  if (!hasBackend()) return null;
  return apiRequest<NurseEarningsSummary>("/api/nurse/earnings");
}
