/**
 * Emergency response module API service.
 * Creates emergency record linked to patient case with location and medical snapshot.
 */

import { hasBackend, apiRequest } from "@/services/api";
import { logAudit } from "@/services/audit";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { EmergencyAlertPayload, EmergencyAlert, MedicalHistorySnapshot } from "./types";

export async function sendEmergencyAlert(payload: EmergencyAlertPayload): Promise<void> {
  logAudit({
    action: "emergency.alert",
    resourceType: "emergency",
    details: {
      hasLocation: Boolean(payload.lat && payload.lng),
      hasCase: Boolean(payload.diagnosisRequestId),
      hasSnapshot: Boolean(payload.medicalHistorySnapshot),
    },
  });

  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    const { error } = await supabase.from("emergency_alerts").insert({
      patient_id: payload.patientId ?? null,
      diagnosis_request_id: payload.diagnosisRequestId ?? null,
      latitude: payload.lat ?? null,
      longitude: payload.lng ?? null,
      address_snapshot: payload.address ?? null,
      medical_history_snapshot: payload.medicalHistorySnapshot
        ? (payload.medicalHistorySnapshot as object)
        : null,
      status: "EMERGENCY_TRIGGERED",
    });
    if (!error) return;
  }

  if (hasBackend()) {
    await apiRequest("/api/emergency/alert", {
      method: "POST",
      body: JSON.stringify({
        patientId: payload.patientId,
        lat: payload.lat,
        lng: payload.lng,
        address: payload.address,
        diagnosisRequestId: payload.diagnosisRequestId,
        medicalHistorySnapshot: payload.medicalHistorySnapshot,
      }),
    });
  }
}

export async function getAlerts(): Promise<EmergencyAlert[]> {
  if (!hasBackend()) return [];
  return apiRequest<EmergencyAlert[]>("/api/emergency/alerts");
}

/**
 * Build a medical history snapshot from the patient's latest diagnosis request.
 * Call from client with Supabase; pass patientId and optional diagnosis row.
 */
export function buildMedicalSnapshotFromCase(diagnosis: {
  symptoms_text?: string | null;
  ai_risk_level?: string | null;
  ai_conditions?: unknown;
  ai_medications?: unknown;
  id?: string;
}): MedicalHistorySnapshot {
  const conditions = Array.isArray(diagnosis.ai_conditions)
    ? (diagnosis.ai_conditions as { name?: string; confidence?: number }[]).map((c) => ({
        name: c.name,
        confidence: c.confidence,
      }))
    : undefined;
  const medications = Array.isArray(diagnosis.ai_medications)
    ? (diagnosis.ai_medications as { name?: string; dosage?: string }[]).map((m) => ({
        name: m.name,
        dosage: m.dosage,
      }))
    : undefined;
  return {
    symptoms: diagnosis.symptoms_text ?? undefined,
    riskLevel: diagnosis.ai_risk_level ?? undefined,
    conditions,
    medications,
    recordedAt: new Date().toISOString(),
  };
}
