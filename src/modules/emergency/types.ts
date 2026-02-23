/**
 * Emergency response module types.
 */

import type { EmergencyAlertStatus } from "@/types";

export interface EmergencyAlertPayload {
  lat?: number;
  lng?: number;
  address?: string;
  patientId?: string;
  diagnosisRequestId?: string;
  medicalHistorySnapshot?: MedicalHistorySnapshot;
}

export interface MedicalHistorySnapshot {
  symptoms?: string;
  riskLevel?: string;
  conditions?: { name?: string; confidence?: number }[];
  medications?: { name?: string; dosage?: string }[];
  recordedAt?: string;
}

export interface EmergencyAlert {
  id: string;
  patient_id?: string | null;
  diagnosis_request_id?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  address_snapshot?: string | null;
  medical_history_snapshot?: unknown;
  status: EmergencyAlertStatus;
  responder_id?: string | null;
  responded_at?: string | null;
  resolved_at?: string | null;
  created_at: string;
}
