/**
 * Pharmacist module API service.
 * Role-based access should be enforced on backend.
 */

import { hasBackend, apiRequest } from "@/services/api";
import type { PharmacistQueueItem, PrescriptionReview } from "./types";

export async function getQueue(): Promise<PharmacistQueueItem[]> {
  if (!hasBackend()) return [];
  return apiRequest<PharmacistQueueItem[]>("/api/pharmacist/queue");
}

export async function getPrescriptions(): Promise<PrescriptionReview[]> {
  if (!hasBackend()) return [];
  return apiRequest<PrescriptionReview[]>("/api/pharmacist/prescriptions");
}

export async function approvePrescription(id: string): Promise<void> {
  if (!hasBackend()) return;
  await apiRequest(`/api/pharmacist/prescriptions/${id}/approve`, { method: "POST" });
}

export async function modifyPrescription(
  id: string,
  medications: { name: string; dosage: string; notes?: string }[]
): Promise<void> {
  if (!hasBackend()) return;
  await apiRequest(`/api/pharmacist/prescriptions/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ medications }),
  });
}

export async function escalateToDoctor(id: string): Promise<void> {
  if (!hasBackend()) return;
  await apiRequest(`/api/pharmacist/prescriptions/${id}/escalate`, { method: "POST" });
}

export async function triggerDispatch(id: string): Promise<void> {
  if (!hasBackend()) return;
  await apiRequest(`/api/pharmacist/prescriptions/${id}/dispatch`, { method: "POST" });
}
