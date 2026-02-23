"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Truck,
  MapPin,
  User,
  CheckCircle,
  Package,
  ArrowLeft,
  Loader2,
  Clock,
} from "lucide-react";
import DispatcherGate from "@/components/dispatcher/DispatcherGate";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { updateCaseStatus } from "@/services/api/cases";
import type { DiagnosisRequest } from "@/lib/supabase/database.types";
import type { DiagnosisRequestStatus } from "@/lib/supabase/database.types";

const DELIVERY_STATUSES: DiagnosisRequestStatus[] = [
  "READY_FOR_DISPATCH",
  "DISPATCH_ASSIGNED",
  "IN_TRANSIT",
  "DELIVERED",
];

const STATUS_LABELS: Record<string, string> = {
  READY_FOR_DISPATCH: "Ready for dispatch",
  DISPATCH_ASSIGNED: "Assigned",
  IN_TRANSIT: "In transit",
  DELIVERED: "Delivered",
};

export default function DispatchPage() {
  const { user, profile } = useAuth();
  const [cases, setCases] = useState<DiagnosisRequest[]>([]);
  const [patientNames, setPatientNames] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DiagnosisRequest | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data: rows, error } = await supabase
      .from("diagnosis_requests")
      .select("*")
      .in("status", DELIVERY_STATUSES)
      .order("created_at", { ascending: false });

    if (error) {
      setLoading(false);
      return;
    }

    const list = (rows ?? []) as DiagnosisRequest[];
    setCases(list);

    const patientIds = [...new Set(list.map((c) => c.patient_id).filter(Boolean))] as string[];
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
    if (profile?.role !== "dispatcher") return;
    fetchData();
  }, [profile?.role, fetchData]);

  const handleUpdateStatus = async (caseId: string, status: DiagnosisRequestStatus) => {
    setStatusError(null);
    setStatusUpdating(caseId);
    try {
      await updateCaseStatus(caseId, status);
      await fetchData();
      if (selected?.id === caseId) {
        setSelected((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setStatusUpdating(null);
    }
  };

  const availableOrders = cases.filter((c) => c.status === "READY_FOR_DISPATCH");
  const myDeliveries = cases.filter(
    (c) => c.dispatcher_id === user?.id && c.status !== "READY_FOR_DISPATCH" && c.status !== "DELIVERED"
  );
  const isAssignedToMe = (c: DiagnosisRequest) => c.dispatcher_id === user?.id;

  return (
    <DispatcherGate>
      <div>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dispatch & Delivery</h1>
            <p className="mt-1 text-slate-600">
              View pharmacy-confirmed orders (READY_FOR_DISPATCH), accept assignments, and update delivery status.
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
            <h2 className="text-lg font-semibold text-slate-900">Orders ready for dispatch</h2>
            {loading ? (
              <p className="text-slate-500">Loading…</p>
            ) : cases.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                <Truck className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-4 text-slate-600">No orders in the delivery workflow yet.</p>
                <p className="mt-1 text-sm text-slate-500">Orders appear here after the pharmacist sets status to Ready for dispatch.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {cases.map((c) => (
                  <li
                    key={c.id}
                    className={`rounded-2xl border p-5 transition ${
                      selected?.id === c.id
                        ? "border-blue-300 bg-blue-50/50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelected(c)}
                      className="w-full text-left"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-slate-500">
                          {new Date(c.created_at).toLocaleString()}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                          {STATUS_LABELS[c.status] ?? c.status}
                        </span>
                        {isAssignedToMe(c) && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                            My assignment
                          </span>
                        )}
                      </div>
                      <p className="mt-2 font-medium text-slate-900">
                        {patientNames.get(c.patient_id ?? "") ?? `Patient ${c.patient_id?.slice(0, 8)}`}
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
            {selected ? (
              <>
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    Delivery details
                  </h3>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">
                        {patientNames.get(selected.patient_id ?? "") ?? `Patient ${selected.patient_id?.slice(0, 8)}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span>Delivery address: To be confirmed with patient or on file.</span>
                    </div>
                    <p className="text-slate-700">
                      <span className="font-medium">Case:</span> {selected.symptoms_text}
                    </p>
                    {selected.ai_risk_level && (
                      <p>
                        Risk: <span className="font-medium">{selected.ai_risk_level}</span>
                      </p>
                    )}
                    {Array.isArray(selected.ai_medications) && selected.ai_medications.length > 0 && (
                      <div>
                        <span className="font-medium text-slate-700">Medications:</span>
                        <ul className="mt-1 list-inside list-disc text-slate-600">
                          {(selected.ai_medications as { name?: string; dosage?: string }[]).map((m, i) => (
                            <li key={i}>{[m.name, m.dosage].filter(Boolean).join(" — ")}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {selected.status === "READY_FOR_DISPATCH" && (
                      <button
                        type="button"
                        disabled={statusUpdating === selected.id}
                        onClick={() => handleUpdateStatus(selected.id, "DISPATCH_ASSIGNED")}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {statusUpdating === selected.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                        Accept assignment
                      </button>
                    )}
                    {isAssignedToMe(selected) && selected.status === "DISPATCH_ASSIGNED" && (
                      <button
                        type="button"
                        disabled={statusUpdating === selected.id}
                        onClick={() => handleUpdateStatus(selected.id, "IN_TRANSIT")}
                        className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                      >
                        {statusUpdating === selected.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
                        In transit
                      </button>
                    )}
                    {isAssignedToMe(selected) && (selected.status === "DISPATCH_ASSIGNED" || selected.status === "IN_TRANSIT") && (
                      <button
                        type="button"
                        disabled={statusUpdating === selected.id}
                        onClick={() => handleUpdateStatus(selected.id, "DELIVERED")}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {statusUpdating === selected.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                        Mark delivered
                      </button>
                    )}
                    {selected.status === "DELIVERED" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-800">
                        <Clock className="h-4 w-4" />
                        Delivered
                      </span>
                    )}
                  </div>
                  {statusError && <p className="mt-3 text-sm text-red-600">{statusError}</p>}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="font-semibold text-slate-900">Summary</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {availableOrders.length} order(s) waiting for assignment.{" "}
                    {myDeliveries.length} active delivery(ies) assigned to you.
                  </p>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                <Truck className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-4 text-sm text-slate-600">Select an order to view delivery details and accept or update status.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DispatcherGate>
  );
}
