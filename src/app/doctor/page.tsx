"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  Stethoscope,
  MapPin,
  CheckCircle,
  Edit3,
  Pill,
  User,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import DoctorGate from "@/components/doctor/DoctorGate";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { RISK_LEVELS } from "@/lib/constants";
import { updateCaseStatus } from "@/services/api/cases";
import type { DiagnosisRequest } from "@/lib/supabase/database.types";
import type { DiagnosisRequestStatus } from "@/lib/supabase/database.types";

type CaseWithPatient = DiagnosisRequest & {
  patient_name?: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  AI_ANALYSIS: "AI analysis",
  PENDING_DOCTOR_REVIEW: "Pending review",
  DOCTOR_APPROVED: "Approved",
  COMPLETED: "Completed",
  PENDING_PHARMACY: "Pending pharmacy",
  PHARMACY_CONFIRMED: "Pharmacy confirmed",
  READY_FOR_DISPATCH: "Ready for dispatch",
  DISPATCH_ASSIGNED: "Dispatch assigned",
  IN_TRANSIT: "In transit",
  DELIVERED: "Delivered",
  NURSE_REQUESTED: "Nurse requested",
  NURSE_ASSIGNED: "Nurse assigned",
  NURSE_EN_ROUTE: "Nurse en route",
  NURSE_IN_PROGRESS: "Nurse in progress",
  NURSE_COMPLETED: "Nurse completed",
  modified: "Modified",
  pending: "Pending",
  pharmacist_review: "Pharmacist review",
  approved: "Approved",
  escalated: "Escalated",
};

export default function DoctorDashboardPage() {
  const { profile } = useAuth();
  const [cases, setCases] = useState<CaseWithPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<CaseWithPatient | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [prescriptionSending, setPrescriptionSending] = useState(false);
  const [nurseRequestSending, setNurseRequestSending] = useState(false);
  const [prescriptionSuccess, setPrescriptionSuccess] = useState<string | null>(null);
  const [nurseRequestSuccess, setNurseRequestSuccess] = useState<string | null>(null);
  const [prescriptionMedications, setPrescriptionMedications] = useState<
    { name: string; dosage: string; notes?: string }[]
  >([]);
  const [nurseReason, setNurseReason] = useState("");
  const [nurseAddress, setNurseAddress] = useState("");
  const [statusError, setStatusError] = useState<string | null>(null);

  const fetchCases = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }
    const { data: rows, error } = await supabase
      .from("diagnosis_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setLoading(false);
      return;
    }

    const list = (rows ?? []) as DiagnosisRequest[];
    const patientIds = [...new Set(list.map((c) => c.patient_id).filter(Boolean))] as string[];
    if (patientIds.length === 0) {
      setCases(list.map((c) => ({ ...c, patient_name: null })));
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

    const userToName = new Map<string, string | null>();
    (profiles ?? []).forEach((p) => userToName.set(p.id, p.full_name ?? null));
    const patientToName = new Map<string, string | null>();
    (patients ?? []).forEach((p) => {
      const name = userToName.get(p.user_id) ?? null;
      patientToName.set(p.id, name);
    });

    setCases(
      list.map((c) => ({
        ...c,
        patient_name: c.patient_id ? patientToName.get(c.patient_id) ?? "—" : null,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    if (profile?.role !== "doctor") return;
    fetchCases();
  }, [profile?.role, fetchCases]);

  const handleUpdateStatus = async (caseId: string, status: DiagnosisRequestStatus) => {
    setStatusError(null);
    setStatusUpdating(caseId);
    try {
      await updateCaseStatus(caseId, status);
      await fetchCases();
      if (selectedCase?.id === caseId) {
        setSelectedCase((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase?.patient_id || prescriptionMedications.length === 0) return;
    setPrescriptionSending(true);
    setPrescriptionSuccess(null);
    try {
      const res = await fetch("/api/doctor/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: selectedCase.patient_id,
          diagnosis_request_id: selectedCase.id,
          medications: prescriptionMedications,
        }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setPrescriptionSuccess("Prescription created.");
        setPrescriptionMedications([]);
      } else {
        setPrescriptionSuccess(data?.error ?? "Failed to create prescription.");
      }
    } finally {
      setPrescriptionSending(false);
    }
  };

  const handleRequestNurse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase?.patient_id) return;
    setNurseRequestSending(true);
    setNurseRequestSuccess(null);
    try {
      const res = await fetch("/api/doctor/nurse-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: selectedCase.patient_id,
          reason: nurseReason || undefined,
          address: nurseAddress || undefined,
          diagnosis_request_id: selectedCase.id,
        }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setNurseRequestSuccess("Nurse visit requested.");
        setNurseReason("");
        setNurseAddress("");
      } else {
        setNurseRequestSuccess(data?.error ?? "Failed to request nurse visit.");
      }
    } finally {
      setNurseRequestSending(false);
    }
  };

  const openCaseDetail = (c: CaseWithPatient) => {
    setSelectedCase(c);
    const meds = (c.ai_medications ?? []) as { name?: string; dosage?: string; notes?: string }[];
    setPrescriptionMedications(
      meds.length > 0
        ? meds.map((m) => ({
            name: m.name ?? "",
            dosage: m.dosage ?? "",
            notes: m.notes,
          }))
        : [{ name: "", dosage: "", notes: "" }]
    );
    setPrescriptionSuccess(null);
    setNurseRequestSuccess(null);
  };

  return (
    <DoctorGate>
      <div>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Doctor Dashboard</h1>
            <p className="mt-1 text-slate-600">
              Review AI-generated cases, approve or modify diagnosis, create prescriptions, and request nurse visits.
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
            <h2 className="text-lg font-semibold text-slate-900">AI-generated cases</h2>
            {loading ? (
              <p className="text-slate-500">Loading cases…</p>
            ) : cases.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                <FileText className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-4 text-slate-600">No cases yet. Cases appear here when patients use Eva.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {cases.map((c) => (
                  <li
                    key={c.id}
                    className={`rounded-2xl border p-5 transition ${
                      selectedCase?.id === c.id
                        ? "border-blue-300 bg-blue-50/50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => openCaseDetail(c)}
                      className="w-full text-left"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-slate-500">
                          {new Date(c.created_at).toLocaleString()}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                          {STATUS_LABELS[c.status] ?? c.status}
                        </span>
                        {c.ai_risk_level && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              RISK_LEVELS[c.ai_risk_level.toUpperCase() as keyof typeof RISK_LEVELS]?.bg ?? "bg-slate-100"
                            } ${RISK_LEVELS[c.ai_risk_level.toUpperCase() as keyof typeof RISK_LEVELS]?.color ?? "text-slate-700"}`}
                          >
                            {c.ai_risk_level}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 font-medium text-slate-900">
                        {c.patient_name ?? `Patient ${c.patient_id?.slice(0, 8) ?? "—"}`}
                      </p>
                      <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                        {c.symptoms_text}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-6">
            {selectedCase ? (
              <>
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="font-semibold text-slate-900">Case details</h3>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">
                        {selectedCase.patient_name ?? `Patient ${selectedCase.patient_id?.slice(0, 8)}`}
                      </span>
                    </div>
                    <p className="text-slate-700">{selectedCase.symptoms_text}</p>
                    {selectedCase.ai_risk_level && (
                      <p>
                        Risk: <span className="font-medium">{selectedCase.ai_risk_level}</span>
                        {selectedCase.ai_confidence != null && ` · ${selectedCase.ai_confidence}% confidence`}
                      </p>
                    )}
                    {Array.isArray(selectedCase.ai_conditions) && selectedCase.ai_conditions.length > 0 && (
                      <div>
                        <span className="font-medium text-slate-700">Possible conditions: </span>
                        {(selectedCase.ai_conditions as { name?: string }[])
                          .map((x) => x.name)
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    )}
                    {Array.isArray(selectedCase.ai_medications) && selectedCase.ai_medications.length > 0 && (
                      <div>
                        <span className="font-medium text-slate-700">AI suggested meds: </span>
                        <ul className="mt-1 list-inside list-disc text-slate-600">
                          {(selectedCase.ai_medications as { name?: string; dosage?: string }[]).map((m, i) => (
                            <li key={i}>{[m.name, m.dosage].filter(Boolean).join(" — ")}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={statusUpdating === selectedCase.id}
                      onClick={() => handleUpdateStatus(selectedCase.id, "PENDING_DOCTOR_REVIEW")}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      {statusUpdating === selectedCase.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Edit3 className="h-4 w-4" />
                      )}
                      Mark for review
                    </button>
                    <button
                      type="button"
                      disabled={statusUpdating === selectedCase.id}
                      onClick={() => handleUpdateStatus(selectedCase.id, "DOCTOR_APPROVED")}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {statusUpdating === selectedCase.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={statusUpdating === selectedCase.id}
                      onClick={() => handleUpdateStatus(selectedCase.id, "modified")}
                      className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50"
                    >
                      Modify
                    </button>
                    <button
                      type="button"
                      disabled={statusUpdating === selectedCase.id}
                      onClick={() => handleUpdateStatus(selectedCase.id, "COMPLETED")}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                    >
                      Mark completed
                    </button>
                  </div>
                  {statusError && (
                    <p className="mt-3 text-sm text-red-600">{statusError}</p>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Pill className="h-5 w-5 text-blue-600" />
                    Create prescription
                  </h3>
                  <form onSubmit={handleCreatePrescription} className="mt-4 space-y-3">
                    {prescriptionMedications.map((m, i) => (
                      <div key={i} className="flex flex-wrap gap-2">
                        <input
                          type="text"
                          placeholder="Medication"
                          value={m.name}
                          onChange={(e) => {
                            const next = [...prescriptionMedications];
                            next[i] = { ...next[i], name: e.target.value };
                            setPrescriptionMedications(next);
                          }}
                          className="flex-1 min-w-[100px] rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Dosage"
                          value={m.dosage}
                          onChange={(e) => {
                            const next = [...prescriptionMedications];
                            next[i] = { ...next[i], dosage: e.target.value };
                            setPrescriptionMedications(next);
                          }}
                          className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setPrescriptionMedications((prev) => prev.filter((_, j) => j !== i))
                          }
                          className="text-slate-400 hover:text-slate-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setPrescriptionMedications((prev) => [...prev, { name: "", dosage: "", notes: "" }])
                      }
                      className="text-sm text-blue-600 hover:underline"
                    >
                      + Add medication
                    </button>
                    {prescriptionSuccess && (
                      <p className={`text-sm ${prescriptionSuccess.startsWith("Prescription") ? "text-emerald-600" : "text-amber-600"}`}>
                        {prescriptionSuccess}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={prescriptionSending || prescriptionMedications.every((m) => !m.name.trim())}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {prescriptionSending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Create prescription
                    </button>
                  </form>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                    Request nurse visit
                  </h3>
                  <form onSubmit={handleRequestNurse} className="mt-4 space-y-3">
                    <input
                      type="text"
                      placeholder="Address or location"
                      value={nurseAddress}
                      onChange={(e) => setNurseAddress(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                    <textarea
                      placeholder="Reason for visit (e.g. wound dressing, medication administration)"
                      value={nurseReason}
                      onChange={(e) => setNurseReason(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                    {nurseRequestSuccess && (
                      <p className={`text-sm ${nurseRequestSuccess.startsWith("Nurse") ? "text-emerald-600" : "text-amber-600"}`}>
                        {nurseRequestSuccess}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={nurseRequestSending}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {nurseRequestSending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Request nurse visit
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                <Stethoscope className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-4 text-sm text-slate-600">Select a case to review patient data, approve or modify diagnosis, create a prescription, or request a nurse visit.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DoctorGate>
  );
}
