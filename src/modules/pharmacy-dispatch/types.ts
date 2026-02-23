/**
 * Pharmacy & dispatch module types.
 */

export interface PharmacyOrder {
  id: string;
  prescriptionId: string;
  status: string;
  medications: { name: string; dosage: string; notes?: string }[];
}

export interface DeliveryOrder {
  id: string;
  prescriptionId: string;
  status: string;
  estimatedArrival?: string;
  deliveredAt?: string;
}

export interface DrugInventoryItem {
  id: string;
  drugName: string;
  quantity: number;
  unit?: string;
}
