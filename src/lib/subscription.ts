/**
 * Patient subscription state (client-side for demo; replace with API/auth in production)
 */
const SUBSCRIPTION_KEY = "medconnect_patient_subscribed";

export function isPatientSubscribed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SUBSCRIPTION_KEY) === "true";
}

export function setPatientSubscribed(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SUBSCRIPTION_KEY, "true");
}
