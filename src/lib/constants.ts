export const BRAND_NAME = "MedConnect";
export const AI_NAME = "Eva";
export const EVA_WAKE_PHRASE = "hi eva";

export const USER_ROLES = {
  PATIENT: "patient",
  NURSE: "nurse",
  PHARMACIST: "pharmacist",
  DOCTOR: "doctor",
  HOSPITAL: "hospital",
  LAB: "lab",
  EMERGENCY_TEAM: "emergency",
} as const;

export const RISK_LEVELS = {
  MILD: { label: "Mild", color: "text-emerald-600", bg: "bg-emerald-50" },
  MODERATE: { label: "Moderate", color: "text-amber-600", bg: "bg-amber-50" },
  EMERGENCY: { label: "Emergency", color: "text-red-600", bg: "bg-red-50" },
} as const;
