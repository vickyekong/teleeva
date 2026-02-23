/**
 * Emergency alert status API (admin): assign responder or resolve.
 */

import { apiRequest } from "./client";

export type EmergencyStatusUpdate = "RESPONDER_ASSIGNED" | "RESOLVED";

export interface EmergencyStatusUpdateResult {
  id: string;
  status: string;
  responder_id?: string | null;
  responded_at?: string | null;
  resolved_at?: string | null;
}

export async function updateEmergencyAlertStatus(
  alertId: string,
  status: EmergencyStatusUpdate
): Promise<EmergencyStatusUpdateResult> {
  return apiRequest<EmergencyStatusUpdateResult>(
    `/api/emergency/alerts/${alertId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  );
}
