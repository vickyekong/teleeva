/**
 * Nurse / medical staff module types.
 */

import type { TreatmentRequestStatus } from "@/types";

export interface NurseJob {
  id: string;
  patientName?: string;
  addressOrLatLng?: string;
  latitude?: number;
  longitude?: number;
  reason?: string;
  diagnosisSummary?: string;
  status: TreatmentRequestStatus;
  createdAt: string;
}

export interface NurseEarningsSummary {
  periodStart: string;
  periodEnd: string;
  totalAmount: number;
}
