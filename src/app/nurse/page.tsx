"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  MapPin,
  Check,
  Navigation,
  ArrowLeft,
  Loader2,
  User,
  FileText,
} from "lucide-react";
import NurseGate from "@/components/nurse/NurseGate";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { updateTreatmentStatus } from "@/services/api/treatment-requests";
import type { TreatmentRequest } from "@/lib/supabase/database.types";
import type { TreatmentRequestStatus } from "@/lib/supabase/database.types";

const NURSE_WORKFLOW_STATUSES: TreatmentRequestStatus[] = [
  "NURSE_ASSIGNED",
  "NURSE_EN_ROUTE",
  "NURSE_IN_PROGRESS",
  "NURSE_COMPLETED",
];

const PENDING_STATUSES = ["pending", "assigned", "en_route", "in_progress"];

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  assigned: "Assigned",
  en_route: "En route",
  in_progress: "In progress",
  completed: "Completed",
  NURSE_ASSIGNED: "Assigned",
  NURSE_EN_ROUTE: "En route",
  NURSE_IN_PROGRESS: "In progress",
  NURSE_COMPLETED: "Completed",
};

export default function NurseDashboardPage() {
  const { user, profile } = useAuth();
  const [requests, setRequests] = useState<TreatmentRequest[]>([]);
  const [patientNames, setPatientNames] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TreatmentRequest | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data: rows, error } = await supabase
      .from("treatment_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setLoading(false);
      return;
    }

    const list = (rows ?? []) as TreatmentRequest[];
    setRequests(list);

    const patientIds = [...new Set(list.map((r) => r.patient_id))];
    if (patientIds.length === 0) {
      setPatientNames(new Map());
      setLoading(false);
      return;
    }

    const { data: patients } = await supabase
      .from("patients")
      .select("id, user_id")
      .in("id", patientIds);
    const userIds = [
      ...new Set((patients ?? []).map((p) => p.user_id).filter(Boolean)),
    ] as string[];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);

    const userToName = new Map<string, string>();
    (profiles ?? []).forEach((p) =>
      userToName.set(p.id, p.full_name ?? "—")
    );
    const patientToName = new Map<string, string>();
    (patients ?? []).forEach((p) =>
      patientToName.set(p.id, userToName.get(p.user_id) ?? "—")
    );
    setPatientNames(patientToName);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (profile?.role !== "nurse") return;
    fetchData();
  }, [profile?.role, fetchData]);

  const canAccept = (r: TreatmentRequest) =>
    PENDING_STATUSES.includes(r.status) && !r.assigned_nurse_id;
  const isMine = (r: TreatmentRequest) => r.assigned_nurse_id === user?.id;
  const isActive = (r: TreatmentRequest) =>
    (NURSE_WORKFLOW_STATUSES.includes(r.status as TreatmentRequestStatus) &&
      r.status !== "NURSE_COMPLETED") ||
    (isMine(r) &&
      ["assigned", "en_route", "in_progress"].includes(r.status) &&
      r.status !== "completed");

  const handleUpdateStatus = async (
    requestId: string,
    status: (typeof NURSE_WORKFLOW_STATUSES)[number]
  ) => {
    setStatusError(null);
    setStatusUpdating(requestId);
    try {
      await updateTreatmentStatus(requestId, status);
      await fetchData();
      if (selected?.id === requestId) {
        setSelected((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err) {
      setStatusError(
        err instanceof Error ? err.message : "Failed to update status"
      );
    } finally {
      setStatusUpdating(null);
    }
  };

  const available = requests.filter((r) => canAccept(r));
  const myActive = requests.filter((r) => isMine(r) && isActive(r));

  return (
    <NurseGate>
      <div>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Nurse Dashboard
            </h1>
            <p className="mt-1 text-slate-600">
              View treatment requests from doctors, accept assignments, and
              update visit status (En route → In progress → Completed).
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
            <h2 className="text-lg font-semibold text-slate-900">
              Treatment requests
            </h2>
            {loading ? (
              <p className="text-slate-500">Loading…</p>
            ) : requests.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                <MapPin className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-4 text-slate-600">
                  No treatment requests yet.
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Requests appear when doctors request a nurse visit for a case.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {requests.map((r) => (
                  <li
                    key={r.id}
                    className={`rounded-2xl border p-5 transition ${
                      selected?.id === r.id
                        ? "border-emerald-300 bg-emerald-50/50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelected(r)}
                      className="w-full text-left"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-slate-500">
                          {new Date(r.created_at).toLocaleString()}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                          {STATUS_LABELS[r.status] ?? r.status}
                        </span>
                        {isMine(r) && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                            My assignment
                          </span>
                        )}
                      </div>
                      <p className="mt-2 font-medium text-slate-900">
                        {patientNames.get(r.patient_id) ??
                          `Patient ${r.patient_id.slice(0, 8)}`}
                      </p>
                      <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                        {r.reason || "No reason provided"}
                      </p>
                      {r.address_or_lat_lng && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="h-3 w-3" />
                          {r.address_or_lat_lng}
                        </p>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-6">
            {selected ? (
              <>
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-emerald-600" />
                    Visit details
                  </h3>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">
                        {patientNames.get(selected.patient_id) ??
                          `Patient ${selected.patient_id.slice(0, 8)}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span>
                        {selected.address_or_lat_lng ||
                          "Address to be confirmed with patient"}
                      </span>
                    </div>
                    <p className="text-slate-700">
                      <span className="font-medium">Reason:</span>{" "}
                      {selected.reason || "—"}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {canAccept(selected) && (
                      <button
                        type="button"
                        disabled={statusUpdating === selected.id}
                        onClick={() =>
                          handleUpdateStatus(selected.id, "NURSE_ASSIGNED")
                        }
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {statusUpdating === selected.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        Accept assignment
                      </button>
                    )}
                    {isMine(selected) &&
                      (selected.status === "NURSE_ASSIGNED" ||
                        selected.status === "assigned") && (
                        <button
                          type="button"
                          disabled={statusUpdating === selected.id}
                          onClick={() =>
                            handleUpdateStatus(selected.id, "NURSE_EN_ROUTE")
                          }
                          className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                        >
                          {statusUpdating === selected.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Navigation className="h-4 w-4" />
                          )}
                          En route
                        </button>
                      )}
                    {isMine(selected) &&
                      (selected.status === "NURSE_ASSIGNED" ||
                        selected.status === "NURSE_EN_ROUTE" ||
                        selected.status === "assigned" ||
                        selected.status === "en_route") && (
                        <button
                          type="button"
                          disabled={statusUpdating === selected.id}
                          onClick={() =>
                            handleUpdateStatus(
                              selected.id,
                              "NURSE_IN_PROGRESS"
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          {statusUpdating === selected.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : null}
                          In progress
                        </button>
                      )}
                    {isMine(selected) &&
                      (selected.status === "NURSE_ASSIGNED" ||
                        selected.status === "NURSE_EN_ROUTE" ||
                        selected.status === "NURSE_IN_PROGRESS" ||
                        selected.status === "assigned" ||
                        selected.status === "en_route" ||
                        selected.status === "in_progress") && (
                        <button
                          type="button"
                          disabled={statusUpdating === selected.id}
                          onClick={() =>
                            handleUpdateStatus(selected.id, "NURSE_COMPLETED")
                          }
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                        >
                          {statusUpdating === selected.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          Mark completed
                        </button>
                      )}
                    {(selected.status === "NURSE_COMPLETED" ||
                      selected.status === "completed") && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-800">
                        <Check className="h-4 w-4" />
                        Completed
                      </span>
                    )}
                  </div>
                  {statusError && (
                    <p className="mt-3 text-sm text-red-600">{statusError}</p>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="font-semibold text-slate-900">Summary</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {available.length} request(s) waiting for assignment.{" "}
                    {myActive.length} active visit(s) assigned to you.
                  </p>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                <MapPin className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-4 text-sm text-slate-600">
                  Select a treatment request to view details and accept or update
                  status.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </NurseGate>
  );
}
