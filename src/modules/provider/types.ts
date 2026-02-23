/**
 * Provider management module types.
 */

import type { ProviderVerificationStatus } from "@/types";

export type ProviderType = "hospital" | "pharmacy" | "nurse" | "pharmacist" | "doctor" | "lab";

export interface ProviderProfile {
  id: string;
  userId?: string;
  providerType: ProviderType;
  businessName?: string;
  licenseNumber?: string;
  verificationStatus: ProviderVerificationStatus;
  metadata?: Record<string, unknown>;
}

export interface RegisterProviderInput {
  providerType: ProviderType;
  businessName?: string;
  fullName?: string;
  email: string;
  licenseNumber?: string;
  serviceFee?: number;
}
