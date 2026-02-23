/**
 * Patient module API service.
 * Use existing UI and routing; this layer is for API-driven data when backend exists.
 */

import { hasBackend, apiRequest } from "@/services/api";
import type {
  PatientProfile,
  MedicalHistoryEntry,
  EmergencyContact,
  HmoProfile,
  PrescriptionSummary,
  TreatmentRequestSummary,
} from "./types";

export async function getMyProfile(): Promise<PatientProfile | null> {
  if (!hasBackend()) return null;
  return apiRequest<PatientProfile>("/api/patients/me");
}

export async function getMedicalHistory(): Promise<MedicalHistoryEntry[]> {
  if (!hasBackend()) return [];
  return apiRequest<MedicalHistoryEntry[]>("/api/patients/me/medical-history");
}

export async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  if (!hasBackend()) return [];
  return apiRequest<EmergencyContact[]>("/api/patients/me/emergency-contacts");
}

export async function getHmoProfiles(): Promise<HmoProfile[]> {
  if (!hasBackend()) return [];
  return apiRequest<HmoProfile[]>("/api/patients/me/hmo");
}

export async function getMyPrescriptions(): Promise<PrescriptionSummary[]> {
  if (!hasBackend()) return [];
  return apiRequest<PrescriptionSummary[]>("/api/patients/me/prescriptions");
}

export async function getMyTreatmentRequests(): Promise<TreatmentRequestSummary[]> {
  if (!hasBackend()) return [];
  return apiRequest<TreatmentRequestSummary[]>("/api/patients/me/treatment-requests");
}
