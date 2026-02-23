/**
 * Nurse treatment request API: update status (NURSE_ASSIGNED, NURSE_EN_ROUTE, NURSE_IN_PROGRESS, NURSE_COMPLETED).
 * Uses same-origin /api/nurse/treatment-requests/[id]/status.
 */

import type { TreatmentRequestStatus } from "@/lib/supabase/database.types";
import { apiRequest } from "./client";

const NURSE_STATUSES: TreatmentRequestStatus[] = [
  "NURSE_ASSIGNED",
  "NURSE_EN_ROUTE",
  "NURSE_IN_PROGRESS",
  "NURSE_COMPLETED",
];

export interface TreatmentStatusUpdateResult {
  id: string;
  status: string;
  diagnosis_request_id?: string | null;
  assigned_nurse_id?: string | null;
  assigned_at?: string | null;
  completed_at?: string | null;
}

export function isNurseWorkflowStatus(
  s: string
): s is (typeof NURSE_STATUSES)[number] {
  return NURSE_STATUSES.includes(s as (typeof NURSE_STATUSES)[number]);
}

export async function updateTreatmentStatus(
  treatmentRequestId: string,
  status: (typeof NURSE_STATUSES)[number]
): Promise<TreatmentStatusUpdateResult> {
  return apiRequest<TreatmentStatusUpdateResult>(
    `/api/nurse/treatment-requests/${treatmentRequestId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  );
}
