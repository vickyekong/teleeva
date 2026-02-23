/**
 * Database types for MedConnect Supabase tables.
 * Aligns with migrations in supabase/migrations/.
 */

export type UserRole =
  | "patient"
  | "nurse"
  | "pharmacist"
  | "doctor"
  | "hospital"
  | "lab"
  | "admin"
  | "dispatcher";

export interface Profile {
  id: string; // same as auth.users(id)
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export type DiagnosisRequestStatus =
  | "pending"
  | "pharmacist_review"
  | "approved"
  | "modified"
  | "escalated"
  | "AI_ANALYSIS"
  | "PENDING_DOCTOR_REVIEW"
  | "DOCTOR_APPROVED"
  | "COMPLETED"
  | "PENDING_PHARMACY"
  | "PHARMACY_CONFIRMED"
  | "READY_FOR_DISPATCH"
  | "DISPATCH_ASSIGNED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "NURSE_REQUESTED"
  | "NURSE_ASSIGNED"
  | "NURSE_EN_ROUTE"
  | "NURSE_IN_PROGRESS"
  | "NURSE_COMPLETED";

export interface DiagnosisRequest {
  id: string;
  patient_id: string | null;
  session_id: string | null;
  symptoms_text: string;
  ai_risk_level: string | null;
  ai_confidence: number | null;
  ai_conditions: unknown[] | null;
  ai_medications: unknown[] | null;
  status: DiagnosisRequestStatus;
  pharmacist_id: string | null;
  dispatcher_id: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type PrescriptionStatus = "draft" | "approved" | "dispatched" | "delivered";

export interface Prescription {
  id: string;
  diagnosis_request_id: string | null;
  patient_id: string;
  doctor_id: string | null;
  pharmacist_id: string | null;
  medications: unknown[];
  status: PrescriptionStatus;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export type TreatmentRequestStatus =
  | "pending"
  | "assigned"
  | "en_route"
  | "in_progress"
  | "completed"
  | "NURSE_ASSIGNED"
  | "NURSE_EN_ROUTE"
  | "NURSE_IN_PROGRESS"
  | "NURSE_COMPLETED";

export interface TreatmentRequest {
  id: string;
  patient_id: string;
  reason: string | null;
  address_or_lat_lng: string | null;
  latitude: number | null;
  longitude: number | null;
  diagnosis_request_id: string | null;
  requested_by_doctor_id: string | null;
  status: TreatmentRequestStatus;
  assigned_nurse_id: string | null;
  assigned_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type EmergencyAlertStatus =
  | "active"
  | "acknowledged"
  | "resolved"
  | "EMERGENCY_TRIGGERED"
  | "RESPONDER_ASSIGNED"
  | "RESOLVED";

export interface EmergencyAlert {
  id: string;
  patient_id: string | null;
  diagnosis_request_id: string | null;
  latitude: number | null;
  longitude: number | null;
  address_snapshot: string | null;
  medical_history_snapshot: unknown;
  status: EmergencyAlertStatus;
  responder_id: string | null;
  admin_acknowledged_at: string | null;
  responded_at: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface Tables {
  profiles: {
    Row: Profile;
    Insert: Omit<Profile, "id" | "created_at" | "updated_at"> & {
      id?: string;
      created_at?: string;
      updated_at?: string;
    };
    Update: Partial<Profile>;
  };
  diagnosis_requests: {
    Row: DiagnosisRequest;
    Insert: Omit<DiagnosisRequest, "id" | "created_at" | "updated_at"> & {
      id?: string;
      created_at?: string;
      updated_at?: string;
    };
    Update: Partial<DiagnosisRequest>;
  };
  prescriptions: {
    Row: Prescription;
    Insert: Omit<Prescription, "id" | "created_at" | "updated_at"> & {
      id?: string;
      created_at?: string;
      updated_at?: string;
    };
    Update: Partial<Prescription>;
  };
  treatment_requests: {
    Row: TreatmentRequest;
    Insert: Omit<TreatmentRequest, "id" | "created_at" | "updated_at"> & {
      id?: string;
      created_at?: string;
      updated_at?: string;
    };
    Update: Partial<TreatmentRequest>;
  };
  emergency_alerts: {
    Row: EmergencyAlert;
    Insert: Omit<EmergencyAlert, "id" | "created_at"> & {
      id?: string;
      created_at?: string;
    };
    Update: Partial<EmergencyAlert>;
  };
}
