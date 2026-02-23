"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Pill,
  FileText,
  CheckCircle,
  Truck,
  User,
  ArrowLeft,
  Loader2,
  Package,
} from "lucide-react";
import PharmacistGate from "@/components/pharmacist/PharmacistGate";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { updateCaseStatus } from "@/services/api/cases";
import type { Prescription, DiagnosisRequest } from "@/lib/supabase/database.types";
import type { DiagnosisRequestStatus } from "@/lib/supabase/database.types";

type PrescriptionWithCase = Prescription & {
  diagnosis_requests?: DiagnosisRequest | null;
};

const CASE_STATUSES_PHARMACY: DiagnosisRequestStatus[] = [
  "DOCTOR_APPROVED",
  "PENDING_PHARMACY",
  "PHARMACY_CONFIRMED",
  "READY_FOR_DISPATCH",
];

const STATUS_LABELS: Record<string, string> = {
  DOCTOR_APPROVED: "Doctor approved",
  PENDING_PHARMACY: "Pending pharmacy",
  PHARMACY_CONFIRMED: "Pharmacy confirmed",
  READY_FOR_DISPATCH: "Ready for dispatch",
  DISPATCH_ASSIGNED: "Dispatch assigned",
  IN_TRANSIT: "In transit",
  DELIVERED: "Delivered",
  draft: "Draft",
  approved: "Approved",
  dispatched: "Dispatched",
  delivered: "Delivered",
};

export default function PharmacistDashboardPage() {
  const { profile } = useAuth();
  const [prescriptions, setPrescriptions] = useState<PrescriptionWithCase[]>([]);
  const [patientNames, setPatientNames] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PrescriptionWithCase | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data: rows, error } = await supabase
      .from("prescriptions")
      .select("*, diagnosis_requests(*)")
      .order("created_at", { ascending: false });

    if (error) {
      setLoading(false);
      return;
    }

    const list = (rows ?? []) as PrescriptionWithCase[];
    setPrescriptions(list);

    const patientIds = [...new Set(list.map((p) => p.patient_id).filter(Boolean))] as string[];
    if (patientIds.length === 0) {
      setPatientNames(new Map());
      setLoading(false);
      return;
    }

    const { data: patients } = await supabase
      .from("patients")
      .select("id, user_id")
      .in("id", patientIds);
    const userIds = [...new Set((patients ?? []).map((p) => p.user_id).filter(Boolean))] as string[];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);

    const userToName = new Map<string, string>();
    (profiles ?? []).forEach((p) => userToName.set(p.id, p.full_name ?? "—"));
    const patientToName = new Map<string, string>();
    (patients ?? []).forEach((p) => patientToName.set(p.id, userToName.get(p.user_id) ?? "—"));
    setPatientNames(patientToName);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (profile?.role !== "pharmacist") return;
    fetchData();
  }, [profile?.role, fetchData]);

  const doctorApprovedPrescriptions = prescriptions.filter((p) => {
    const caseStatus = p.diagnosis_requests?.status;
    return caseStatus && CASE_STATUSES_PHARMACY.includes(caseStatus as DiagnosisRequestStatus);
  });

  const handleUpdateCaseStatus = async (caseId: string, status: DiagnosisRequestStatus) => {
    if (!caseId) return;
    setStatusError(null);
    setStatusUpdating(caseId);
    try {
      await updateCaseStatus(caseId, status);
      await fetchData();
      if (selected?.diagnosis_request_id === caseId && selected.diagnosis_requests) {
        setSelected((prev) =>
          prev ? { ...prev, diagnosis_requests: { ...prev.diagnosis_requests!, status } } : null
        );
      }
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setStatusUpdating(null);
    }
  };

  const caseStatus = selected?.diagnosis_requests?.status;
  const caseId = selected?.diagnosis_request_id;

  return (
    <PharmacistGate>
      <div>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Pharmacist Dashboard</h1>
            <p className="mt-1 text-slate-600">
              View doctor-approved prescriptions, confirm medication availability, and update status for dispatch.
            </p>
          </div>
          <Link
            href="/provider-portal"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Provider portal
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Doctor-approved prescriptions</h2>
            {loading ? (
              <p className="text-slate-500">Loading…</p>
            ) : doctorApprovedPrescriptions.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                <Pill className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-4 text-slate-600">No doctor-approved prescriptions in the queue yet.</p>
                <p className="mt-1 text-sm text-slate-500">Cases appear here after a doctor approves and creates a prescription.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {doctorApprovedPrescriptions.map((rx) => {
                  const caseStatusKey = rx.diagnosis_requests?.status ?? "";
                  return (
                    <li
                      key={rx.id}
                      className={`rounded-2xl border p-5 transition ${
                        selected?.id === rx.id
                          ? "border-violet-300 bg-violet-50/50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelected(rx)}
                        className="w-full text-left"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-slate-500">
                            {new Date(rx.created_at).toLocaleString()}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                            {STATUS_LABELS[caseStatusKey] ?? caseStatusKey}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                            Rx {rx.status}
                          </span>
                        </div>
                        <p className="mt-2 font-medium text-slate-900">
                          {patientNames.get(rx.patient_id) ?? `Patient ${rx.patient_id?.slice(0, 8)}`}
                        </p>
                        <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                          {rx.diagnosis_requests?.symptoms_text ?? "—"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {(rx.medications as unknown[])?.length ?? 0} medication(s)
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="space-y-6">
            {selected ? (
              <>
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-violet-600" />
                    Case & prescription details
                  </h3>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">
                        {patientNames.get(selected.patient_id) ?? `Patient ${selected.patient_id?.slice(0, 8)}`}
                      </span>
                    </div>
                    {selected.diagnosis_requests && (
                      <>
                        <p className="text-slate-700">
                          <span className="font-medium">Symptoms:</span> {selected.diagnosis_requests.symptoms_text}
                        </p>
                        {selected.diagnosis_requests.ai_risk_level && (
                          <p>
                            Risk: <span className="font-medium">{selected.diagnosis_requests.ai_risk_level}</span>
                          </p>
                        )}
                        {Array.isArray(selected.diagnosis_requests.ai_conditions) &&
                          selected.diagnosis_requests.ai_conditions.length > 0 && (
                            <div>
                              <span className="font-medium text-slate-700">AI conditions: </span>
                              {(selected.diagnosis_requests.ai_conditions as { name?: string }[])
                                .map((x) => x.name)
                                .filter(Boolean)
                                .join(", ")}
                            </div>
                          )}
                      </>
                    )}
                    <div className="pt-2 border-t border-slate-100">
                      <span className="font-medium text-slate-700">Medications:</span>
                      <ul className="mt-1 list-inside list-disc text-slate-600">
                        {(selected.medications as { name?: string; dosage?: string; notes?: string }[])?.map((m, i) => (
                          <li key={i}>
                            {[m.name, m.dosage].filter(Boolean).join(" — ")}
                            {m.notes && ` (${m.notes})`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {caseId && (
                    <>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={statusUpdating === caseId}
                          onClick={() => handleUpdateCaseStatus(caseId, "PENDING_PHARMACY")}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          {statusUpdating === caseId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
                          In progress
                        </button>
                        <button
                          type="button"
                          disabled={statusUpdating === caseId}
                          onClick={() => handleUpdateCaseStatus(caseId, "PHARMACY_CONFIRMED")}
                          className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
                        >
                          {statusUpdating === caseId ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                          Confirm availability
                        </button>
                        <button
                          type="button"
                          disabled={statusUpdating === caseId}
                          onClick={() => handleUpdateCaseStatus(caseId, "READY_FOR_DISPATCH")}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {statusUpdating === caseId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
                          Ready for dispatch
                        </button>
                      </div>
                      {statusError && <p className="mt-3 text-sm text-red-600">{statusError}</p>}
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                <Pill className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-4 text-sm text-slate-600">Select a prescription to view case details, confirm medication availability, and update status.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PharmacistGate>
  );
}
