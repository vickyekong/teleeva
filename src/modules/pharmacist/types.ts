/**
 * Pharmacist module types.
 */

import type { DiagnosisResult, PrescriptionItem } from "@/types";

export interface PharmacistQueueItem {
  id: string;
  patientId: string;
  symptomsText: string;
  aiRiskLevel?: string;
  aiConfidence?: number;
  aiConditions?: unknown[];
  aiMedications?: PrescriptionItem[];
  status: string;
  createdAt: string;
}

export interface PrescriptionReview {
  id: string;
  diagnosisRequestId: string;
  medications: PrescriptionItem[];
  status: string;
}
