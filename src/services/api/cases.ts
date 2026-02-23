/**
 * Case workflow API: update diagnosis request status.
 * Uses same-origin /api/cases/[id]/status (or NEXT_PUBLIC_API_URL when set).
 */

import type { DiagnosisRequestStatus } from "@/lib/supabase/database.types";
import { apiRequest } from "./client";

export interface CaseStatusUpdateResult {
  id: string;
  status: string;
  updated_at: string;
  reviewed_at?: string | null;
}

/**
 * Update a diagnosis case's workflow status.
 * Allowed callers: doctor, pharmacist, admin (enforced by API).
 */
export async function updateCaseStatus(
  caseId: string,
  status: DiagnosisRequestStatus
): Promise<CaseStatusUpdateResult> {
  return apiRequest<CaseStatusUpdateResult>(`/api/cases/${caseId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
