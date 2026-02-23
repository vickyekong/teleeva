"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  MapPin,
  User,
  CheckCircle,
  Loader2,
  ArrowLeft,
  FileText,
  Radio,
  LayoutDashboard,
  Siren,
  Users,
  BarChart3,
  UserCog,
  ClipboardList,
} from "lucide-react";
import AdminGate from "@/components/admin/AdminGate";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { updateEmergencyAlertStatus } from "@/services/api/emergency";
import type {
  EmergencyAlert,
  DiagnosisRequest,
  Profile,
} from "@/lib/supabase/database.types";

const EMERGENCY_STATUS_LABELS: Record<string, string> = {
  EMERGENCY_TRIGGERED: "Triggered",
  RESPONDER_ASSIGNED: "Responder assigned",
  RESOLVED: "Resolved",
  active: "Active",
  acknowledged: "Acknowledged",
  resolved: "Resolved",
};

const CASE_STATUS_LABELS: Record<string, string> = {
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

type TabId = "cases" | "emergency" | "providers" | "analytics" | "users";

type CaseWithPatient = DiagnosisRequest & { patient_name?: string | null };

type PatientWithProfile = {
  id: string;
  user_id: string;
  created_at: string;
  full_name: string | null;
};

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("cases");

  // Cases
  const [cases, setCases] = useState<CaseWithPatient[]>([]);
  const [casesLoading, setCasesLoading] = useState(false);

  // Emergency
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [patientNames, setPatientNames] = useState<Map<string, string>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<EmergencyAlert | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Providers
  const [providers, setProviders] = useState<Profile[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [updatingProviderId, setUpdatingProviderId] = useState<string | null>(null);
  const [providerError, setProviderError] = useState<string | null>(null);

  // Analytics
  const [analytics, setAnalytics] = useState<{
    casesTotal: number;
    casesByStatus: Record<string, number>;
    alertsActive: number;
    alertsResolved: number;
    prescriptionsTotal: number;
    treatmentRequestsTotal: number;
    avgCompletionHours: number | null;
  } | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Users (patients)
  const [userList, setUserList] = useState<PatientWithProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const fetchCases = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setCasesLoading(true);
    const { data: rows, error: fetchError } = await supabase
      .from("diagnosis_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setCasesLoading(false);
      return;
    }

    const list = (rows ?? []) as DiagnosisRequest[];
    const patientIds = [
      ...new Set(list.map((c) => c.patient_id).filter(Boolean)),
    ] as string[];
    if (patientIds.length === 0) {
      setCases(list.map((c) => ({ ...c, patient_name: null })));
      setCasesLoading(false);
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

    const userToName = new Map<string, string | null>();
    (profiles ?? []).forEach((p) => userToName.set(p.id, p.full_name ?? null));
    const patientToName = new Map<string, string | null>();
    (patients ?? []).forEach((p) => {
      patientToName.set(p.id, userToName.get(p.user_id) ?? null);
    });

    setCases(
      list.map((c) => ({
        ...c,
        patient_name: c.patient_id
          ? patientToName.get(c.patient_id) ?? "—"
          : null,
      }))
    );
    setCasesLoading(false);
  }, []);

  const fetchAlerts = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data: rows, error: fetchError } = await supabase
      .from("emergency_alerts")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setLoading(false);
      return;
    }

    const list = (rows ?? []) as EmergencyAlert[];
    setAlerts(list);

    const patientIds = [
      ...new Set(list.map((a) => a.patient_id).filter(Boolean)),
    ] as string[];
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
    (profiles ?? []).forEach((p) => userToName.set(p.id, p.full_name ?? "—"));
    const patientToName = new Map<string, string>();
    (patients ?? []).forEach((p) =>
      patientToName.set(p.id, userToName.get(p.user_id) ?? "—")
    );
    setPatientNames(patientToName);
    setLoading(false);
  }, []);

  const fetchProviders = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setProvidersLoading(true);
    const { data, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .in("role", ["doctor", "nurse", "pharmacist", "dispatcher"])
      .order("role")
      .order("full_name", { ascending: true });

    if (fetchError) {
      setProvidersLoading(false);
      return;
    }
    setProviders((data ?? []) as Profile[]);
    setProvidersLoading(false);
  }, []);

  const isProviderApproved = (p: Profile): boolean => {
    const m = p.metadata as Record<string, unknown> | null;
    if (!m) return false;
    return m.approved === true || m.approved === "true";
  };

  const handleProviderApprove = async (profileId: string, approved: boolean) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setProviderError(null);
    setUpdatingProviderId(profileId);
    try {
      const p = providers.find((x) => x.id === profileId);
      const existing = (p?.metadata as Record<string, unknown>) || {};
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          metadata: { ...existing, approved },
          updated_at: new Date().toISOString(),
        })
        .eq("id", profileId);

      if (updateError) throw updateError;
      await fetchProviders();
    } catch (err) {
      setProviderError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setUpdatingProviderId(null);
    }
  };

  const fetchAnalytics = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setAnalyticsLoading(true);

    const [casesRes, alertsRes, prescriptionsRes, treatmentRes] =
      await Promise.all([
        supabase.from("diagnosis_requests").select("id, status, created_at, updated_at"),
        supabase.from("emergency_alerts").select("id, status"),
        supabase.from("prescriptions").select("id"),
        supabase.from("treatment_requests").select("id"),
      ]);

    const caseRows = (casesRes.data ?? []) as {
      id: string;
      status: string;
      created_at: string;
      updated_at: string;
    }[];
    const alertRows = (alertsRes.data ?? []) as { id: string; status: string }[];

    const casesByStatus: Record<string, number> = {};
    caseRows.forEach((r) => {
      casesByStatus[r.status] = (casesByStatus[r.status] ?? 0) + 1;
    });

    const completed = caseRows.filter(
      (r) => r.status === "COMPLETED" || r.status === "DELIVERED" || r.status === "NURSE_COMPLETED"
    );
    let avgCompletionHours: number | null = null;
    if (completed.length > 0) {
      const totalMs = completed.reduce((acc, r) => {
        const created = new Date(r.created_at).getTime();
        const updated = new Date(r.updated_at).getTime();
        return acc + (updated - created);
      }, 0);
      avgCompletionHours = totalMs / completed.length / (1000 * 60 * 60);
    }

    const alertsActive = alertRows.filter(
      (a) =>
        a.status === "EMERGENCY_TRIGGERED" ||
        a.status === "RESPONDER_ASSIGNED" ||
        a.status === "active" ||
        a.status === "acknowledged"
    ).length;
    const alertsResolved = alertRows.filter(
      (a) => a.status === "RESOLVED" || a.status === "resolved"
    ).length;

    setAnalytics({
      casesTotal: caseRows.length,
      casesByStatus,
      alertsActive,
      alertsResolved,
      prescriptionsTotal: (prescriptionsRes.data ?? []).length,
      treatmentRequestsTotal: (treatmentRes.data ?? []).length,
      avgCompletionHours,
    });
    setAnalyticsLoading(false);
  }, []);

  const fetchUsers = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setUsersLoading(true);
    const { data: patients, error: patientsError } = await supabase
      .from("patients")
      .select("id, user_id, created_at")
      .order("created_at", { ascending: false });

    if (patientsError || !patients?.length) {
      setUserList([]);
      setUsersLoading(false);
      return;
    }

    const userIds = [...new Set(patients.map((p) => p.user_id).filter(Boolean))] as string[];
    if (userIds.length === 0) {
      setUserList(patients.map((p) => ({ ...p, full_name: null })));
      setUsersLoading(false);
      return;
    }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);

    const profileMap = new Map<string, string | null>();
    (profiles ?? []).forEach((p) => profileMap.set(p.id, p.full_name ?? null));

    setUserList(
      patients.map((p) => ({
        ...p,
        full_name: profileMap.get(p.user_id) ?? null,
      }))
    );
    setUsersLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === "cases") fetchCases();
  }, [activeTab, fetchCases]);

  useEffect(() => {
    if (activeTab === "emergency") fetchAlerts();
  }, [activeTab, fetchAlerts]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || activeTab !== "emergency") return;

    const channel = supabase
      .channel("emergency_alerts_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "emergency_alerts",
        },
        () => fetchAlerts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab, fetchAlerts]);

  useEffect(() => {
    if (activeTab === "providers") fetchProviders();
  }, [activeTab, fetchProviders]);

  useEffect(() => {
    if (activeTab === "analytics") fetchAnalytics();
  }, [activeTab, fetchAnalytics]);

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
  }, [activeTab, fetchUsers]);

  const handleUpdateStatus = async (
    alertId: string,
    status: "RESPONDER_ASSIGNED" | "RESOLVED"
  ) => {
    setError(null);
    setUpdating(alertId);
    try {
      await updateEmergencyAlertStatus(alertId, status);
      await fetchAlerts();
      if (selected?.id === alertId) {
        setSelected((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setUpdating(null);
    }
  };

  const activeAlerts = alerts.filter(
    (a) =>
      a.status === "EMERGENCY_TRIGGERED" ||
      a.status === "RESPONDER_ASSIGNED" ||
      a.status === "active" ||
      a.status === "acknowledged"
  );

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "cases", label: "Cases", icon: <ClipboardList className="h-4 w-4" /> },
    { id: "emergency", label: "Emergency", icon: <Siren className="h-4 w-4" /> },
    { id: "providers", label: "Providers", icon: <Users className="h-4 w-4" /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "users", label: "Users", icon: <UserCog className="h-4 w-4" /> },
  ];

  return (
    <AdminGate>
      <div>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <LayoutDashboard className="h-7 w-7" />
              Admin Control Center
            </h1>
            <p className="mt-1 text-slate-600">
              Global case monitoring, emergency management, providers, analytics, and user management.
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

        <div className="mb-6 flex flex-wrap gap-1 rounded-2xl border border-slate-200 bg-slate-50/50 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                activeTab === tab.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Cases */}
        {activeTab === "cases" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Global case monitoring</h2>
            {casesLoading ? (
              <p className="text-slate-500 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </p>
            ) : cases.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                <ClipboardList className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-4 text-slate-600">No cases yet.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-4 py-3 font-medium text-slate-700">Patient</th>
                        <th className="px-4 py-3 font-medium text-slate-700">Status</th>
                        <th className="px-4 py-3 font-medium text-slate-700">Created</th>
                        <th className="px-4 py-3 font-medium text-slate-700">ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cases.map((c) => (
                        <tr
                          key={c.id}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                        >
                          <td className="px-4 py-3 text-slate-900">
                            {c.patient_name ?? `Patient ${c.patient_id?.slice(0, 8) ?? "—"}`}
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                              {CASE_STATUS_LABELS[c.status] ?? c.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {new Date(c.created_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-slate-500">
                            {c.id.slice(0, 8)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Emergency */}
        {activeTab === "emergency" && (
          <>
            <div className="mb-4 flex items-center gap-2 text-sm text-slate-600">
              <Radio className="h-4 w-4 text-emerald-600" />
              Live updates enabled
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Emergency alerts</h2>
                {loading ? (
                  <p className="text-slate-500">Loading…</p>
                ) : alerts.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-slate-300" />
                    <p className="mt-4 text-slate-600">No emergency alerts yet.</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Alerts appear here when patients use the one-click emergency button.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {alerts.map((a) => (
                      <li
                        key={a.id}
                        className={`rounded-2xl border p-5 transition ${
                          selected?.id === a.id
                            ? "border-red-300 bg-red-50/50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setSelected(a)}
                          className="w-full text-left"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-slate-500">
                              {new Date(a.created_at).toLocaleString()}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                a.status === "EMERGENCY_TRIGGERED" || a.status === "active"
                                  ? "bg-red-100 text-red-800"
                                  : a.status === "RESOLVED" || a.status === "resolved"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {EMERGENCY_STATUS_LABELS[a.status] ?? a.status}
                            </span>
                          </div>
                          <p className="mt-2 font-medium text-slate-900">
                            {a.patient_id
                              ? patientNames.get(a.patient_id) ??
                                `Patient ${a.patient_id.slice(0, 8)}`
                              : "Unknown patient"}
                          </p>
                          {(a.address_snapshot || (a.latitude != null && a.longitude != null)) && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                              <MapPin className="h-3 w-3" />
                              {a.address_snapshot ||
                                `Lat ${a.latitude}, Lng ${a.longitude}`}
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
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        Alert details
                      </h3>
                      <div className="mt-4 space-y-3 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-600">
                            {selected.patient_id
                              ? patientNames.get(selected.patient_id) ??
                                `Patient ${selected.patient_id.slice(0, 8)}`
                              : "Unknown patient"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span>
                            {selected.address_snapshot ||
                              (selected.latitude != null && selected.longitude != null
                                ? `${selected.latitude}, ${selected.longitude}`
                                : "No location")}
                          </span>
                        </div>
                        {selected.medical_history_snapshot &&
                          typeof selected.medical_history_snapshot === "object" && (
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                              <span className="font-medium text-slate-700 flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                Medical snapshot
                              </span>
                              <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs text-slate-600">
                                {JSON.stringify(
                                  selected.medical_history_snapshot as object,
                                  null,
                                  2
                                )}
                              </pre>
                            </div>
                          )}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {(selected.status === "EMERGENCY_TRIGGERED" ||
                          selected.status === "active" ||
                          selected.status === "acknowledged") && (
                          <button
                            type="button"
                            disabled={updating === selected.id}
                            onClick={() =>
                              handleUpdateStatus(selected.id, "RESPONDER_ASSIGNED")
                            }
                            className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                          >
                            {updating === selected.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <User className="h-4 w-4" />
                            )}
                            Assign to me
                          </button>
                        )}
                        {(selected.status === "EMERGENCY_TRIGGERED" ||
                          selected.status === "RESPONDER_ASSIGNED" ||
                          selected.status === "active" ||
                          selected.status === "acknowledged") && (
                          <button
                            type="button"
                            disabled={updating === selected.id}
                            onClick={() => handleUpdateStatus(selected.id, "RESOLVED")}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {updating === selected.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            Mark resolved
                          </button>
                        )}
                        {(selected.status === "RESOLVED" ||
                          selected.status === "resolved") && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-800">
                            <CheckCircle className="h-4 w-4" />
                            Resolved
                          </span>
                        )}
                      </div>
                      {error && (
                        <p className="mt-3 text-sm text-red-600">{error}</p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                      <h3 className="font-semibold text-slate-900">Summary</h3>
                      <p className="mt-2 text-sm text-slate-600">
                        {activeAlerts.length} active alert(s). {alerts.length} total.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-slate-300" />
                    <p className="mt-4 text-sm text-slate-600">
                      Select an alert to view details and assign or resolve.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Providers */}
        {activeTab === "providers" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Provider management</h2>
            {providersLoading ? (
              <p className="text-slate-500 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </p>
            ) : providers.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                <Users className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-4 text-slate-600">No providers found.</p>
              </div>
            ) : (
              <>
                {providerError && (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                    {providerError}
                  </p>
                )}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="px-4 py-3 font-medium text-slate-700">Name</th>
                          <th className="px-4 py-3 font-medium text-slate-700">Role</th>
                          <th className="px-4 py-3 font-medium text-slate-700">Status</th>
                          <th className="px-4 py-3 font-medium text-slate-700">User ID</th>
                          <th className="px-4 py-3 font-medium text-slate-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {providers.map((p) => {
                          const approved = isProviderApproved(p);
                          const busy = updatingProviderId === p.id;
                          return (
                            <tr
                              key={p.id}
                              className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                            >
                              <td className="px-4 py-3 font-medium text-slate-900">
                                {p.full_name ?? "—"}
                              </td>
                              <td className="px-4 py-3">
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-700">
                                  {p.role}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {approved ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    Approved
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                                    Pending
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 font-mono text-xs text-slate-500">
                                {p.id.slice(0, 8)}
                              </td>
                              <td className="px-4 py-3">
                                {approved ? (
                                  <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() => handleProviderApprove(p.id, false)}
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                  >
                                    {busy ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      "Revoke"
                                    )}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() => handleProviderApprove(p.id, true)}
                                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                                  >
                                    {busy ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <>
                                        <CheckCircle className="h-3.5 w-3.5" />
                                        Approve
                                      </>
                                    )}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Analytics */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900">System performance</h2>
            {analyticsLoading ? (
              <p className="text-slate-500 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </p>
            ) : analytics ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="text-sm font-medium text-slate-500">Total cases</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      {analytics.casesTotal}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="text-sm font-medium text-slate-500">Active emergencies</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      {analytics.alertsActive}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="text-sm font-medium text-slate-500">Resolved emergencies</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      {analytics.alertsResolved}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="text-sm font-medium text-slate-500">Prescriptions</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      {analytics.prescriptionsTotal}
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="text-sm font-medium text-slate-500">Treatment requests</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      {analytics.treatmentRequestsTotal}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="text-sm font-medium text-slate-500">Avg. workflow completion</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      {analytics.avgCompletionHours != null
                        ? `${analytics.avgCompletionHours.toFixed(1)} h`
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="font-medium text-slate-700">Cases by status</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(analytics.casesByStatus).map(([status, count]) => (
                      <span
                        key={status}
                        className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                      >
                        {CASE_STATUS_LABELS[status] ?? status}: {count}
                      </span>
                    ))}
                    {Object.keys(analytics.casesByStatus).length === 0 && (
                      <span className="text-slate-500">No data</span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                <BarChart3 className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-4 text-slate-600">Unable to load analytics.</p>
              </div>
            )}
          </div>
        )}

        {/* Users */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">User management (patients)</h2>
            {usersLoading ? (
              <p className="text-slate-500 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </p>
            ) : userList.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                <UserCog className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-4 text-slate-600">No patient accounts yet.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-4 py-3 font-medium text-slate-700">Name</th>
                        <th className="px-4 py-3 font-medium text-slate-700">Patient ID</th>
                        <th className="px-4 py-3 font-medium text-slate-700">User ID</th>
                        <th className="px-4 py-3 font-medium text-slate-700">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userList.map((u) => (
                        <tr
                          key={u.id}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                        >
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {u.full_name ?? "—"}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-slate-600">
                            {u.id.slice(0, 8)}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-slate-500">
                            {u.user_id.slice(0, 8)}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {new Date(u.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminGate>
  );
}
