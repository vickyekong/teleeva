/**
 * Admin control center module types.
 */

export interface ActiveRequestSummary {
  id: string;
  type: string;
  status: string;
  createdAt: string;
}

export interface EmergencyAlertSummary {
  id: string;
  patientId?: string;
  status: string;
  createdAt: string;
}

export interface ProviderActivitySummary {
  providerId: string;
  providerType: string;
  verificationStatus: string;
  recentActivity?: string;
}

export interface SystemAnalytics {
  activeRequestsCount: number;
  emergencyAlertsCount: number;
  providersCount: number;
  prescriptionsApprovedCount?: number;
}
