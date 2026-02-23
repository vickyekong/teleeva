/**
 * Pharmacy & dispatch module API service.
 */

import { hasBackend, apiRequest } from "@/services/api";
import type { PharmacyOrder, DeliveryOrder, DrugInventoryItem } from "./types";

export async function getPharmacyOrders(): Promise<PharmacyOrder[]> {
  if (!hasBackend()) return [];
  return apiRequest<PharmacyOrder[]>("/api/pharmacy/orders");
}

export async function getInventory(): Promise<DrugInventoryItem[]> {
  if (!hasBackend()) return [];
  return apiRequest<DrugInventoryItem[]>("/api/pharmacy/inventory");
}

export async function getDeliveries(): Promise<DeliveryOrder[]> {
  if (!hasBackend()) return [];
  return apiRequest<DeliveryOrder[]>("/api/dispatch/deliveries");
}

export async function updateDeliveryStatus(
  id: string,
  status: string
): Promise<void> {
  if (!hasBackend()) return;
  await apiRequest(`/api/dispatch/deliveries/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
