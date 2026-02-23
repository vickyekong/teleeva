/**
 * Supabase integration for MedConnect.
 * Use createClient() or getSupabaseBrowserClient() in client code.
 * For server: import createServerSupabaseClient from "@/lib/supabase/server" (when not using static export).
 */

export { createClient, getSupabaseBrowserClient } from "./client";
export type {
  Profile,
  DiagnosisRequest,
  Tables,
  UserRole,
  DiagnosisRequestStatus,
  Prescription,
  TreatmentRequest,
  PrescriptionStatus,
  TreatmentRequestStatus,
} from "./database.types";
