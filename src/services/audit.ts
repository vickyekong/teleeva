/**
 * Audit logging adapter.
 * In production, send to backend (e.g. POST /api/audit or internal logger).
 * Do not log PHI in plain text; use resource IDs and action types.
 */

export type AuditAction =
  | "auth.login"
  | "auth.logout"
  | "diagnosis.request"
  | "prescription.approve"
  | "prescription.modify"
  | "emergency.alert"
  | "treatment.accept"
  | "treatment.complete";

export interface AuditEntry {
  action: AuditAction;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
}

export function logAudit(entry: AuditEntry): void {
  if (typeof window === "undefined") return;
  // When backend exists: apiRequest('/api/audit', { method: 'POST', body: JSON.stringify(entry) })
  if (process.env.NODE_ENV === "development") {
    console.debug("[Audit]", entry);
  }
}
