/**
 * Shared domain types for MedConnect.
 * Extend as needed; do not remove existing fields used by the app.
 */

export type UserRole =
  | "patient"
  | "nurse"
  | "pharmacist"
  | "doctor"
  | "hospital"
  | "lab"
  | "admin"
  | "dispatcher"
  | "emergency";

export type RiskLevel = "mild" | "moderate" | "emergency";

export interface DiagnosisCondition {
  name: string;
  confidence?: number;
}

export interface DiagnosisMedication {
  name: string;
  dosage: string;
  notes?: string;
}

export interface DiagnosisResult {
  requestId: string;
  riskLevel: RiskLevel;
  confidence: number;
  conditions: DiagnosisCondition[];
  medications: DiagnosisMedication[];
  disclaimer?: string;
}

export interface PrescriptionItem {
  name: string;
  dosage: string;
  notes?: string;
}

export type PrescriptionStatus = "draft" | "approved" | "dispatched" | "delivered";

export type TreatmentRequestStatus =
  | "pending"
  | "assigned"
  | "en_route"
  | "in_progress"
  | "completed";

export type EmergencyAlertStatus =
  | "active"
  | "acknowledged"
  | "resolved"
  | "EMERGENCY_TRIGGERED"
  | "RESPONDER_ASSIGNED"
  | "RESOLVED";

export type ProviderVerificationStatus = "pending" | "verified" | "rejected";
