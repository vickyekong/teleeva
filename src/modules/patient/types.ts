/**
 * Patient module types.
 * Align with docs/DATABASE_SCHEMA.md and API_ENDPOINTS.md.
 */

import type { PrescriptionItem, TreatmentRequestStatus } from "@/types";

export interface PatientProfile {
  id: string;
  userId?: string;
  dateOfBirth?: string;
  bloodType?: string;
  allergies?: string;
}

export interface MedicalHistoryEntry {
  id: string;
  recordType: string;
  summary: string;
  recordedAt?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship?: string;
  isPrimary?: boolean;
}

export interface HmoProfile {
  id: string;
  providerName: string;
  memberId: string;
  groupNumber?: string;
  coverageDetails?: Record<string, unknown>;
}

export interface PrescriptionSummary {
  id: string;
  medications: PrescriptionItem[];
  status: string;
  approvedAt?: string;
}

export interface TreatmentRequestSummary {
  id: string;
  reason?: string;
  addressOrLatLng?: string;
  status: TreatmentRequestStatus;
  assignedNurseId?: string;
  completedAt?: string;
}
