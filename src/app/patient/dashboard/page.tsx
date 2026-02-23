"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageCircle,
  FileText,
  Calendar,
  Users,
  MapPin,
  Heart,
  Truck,
  Bell,
} from "lucide-react";
import SubscriptionGate from "@/components/patient/SubscriptionGate";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type MedicalHistoryRow = {
  id: string;
  patient_id: string;
  record_type: string | null;
  summary: string | null;
  recorded_at: string | null;
  created_at: string;
};

const tabs = [
  { id: "overview", label: "Overview", icon: Heart },
  { id: "history", label: "Medical History", icon: FileText },
  { id: "prescriptions", label: "Prescriptions", icon: FileText },
  { id: "appointments", label: "Appointments", icon: Calendar },
  { id: "nurse", label: "Nurse Visit", icon: MapPin },
  { id: "contacts", label: "Emergency Contacts", icon: Users },
  { id: "reminders", label: "Health Reminders", icon: Bell },
];

export default function PatientDashboardPage() {
  const { patientId } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [newRecordType, setNewRecordType] = useState("diagnosis");
  const [newSummary, setNewSummary] = useState("");

  useEffect(() => {
    if (activeTab !== "history" || !patientId) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setHistoryLoading(true);
    supabase
      .from("medical_history")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setMedicalHistory((data as MedicalHistoryRow[]) ?? []);
        setHistoryLoading(false);
      });
  }, [activeTab, patientId]);

  const addMedicalHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !newSummary.trim()) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data: inserted } = await supabase
      .from("medical_history")
      .insert({
        patient_id: patientId,
        record_type: newRecordType,
        summary: newSummary.trim(),
        recorded_at: new Date().toISOString(),
      })
      .select()
      .single();
    setNewSummary("");
    if (inserted) setMedicalHistory((prev) => [inserted as MedicalHistoryRow, ...prev]);
  };

  return (
    <SubscriptionGate>
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patient Dashboard</h1>
          <p className="mt-1 text-slate-600">
            Manage your health records, prescriptions, appointments, and nurse visits.
          </p>
        </div>
        <img
          src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&q=80"
          alt="Your care at a glance"
          className="h-24 w-full rounded-xl object-cover sm:h-20 sm:w-40"
        />
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === t.id
                ? "bg-blue-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "overview" && (
            <>
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Link
                    href="/ai-diagnosis"
                    className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 hover:border-blue-200 hover:bg-blue-50"
                  >
                    <MessageCircle className="h-8 w-8 text-blue-600" />
                    <span className="font-medium">Eva — AI Chat / Diagnosis</span>
                  </Link>
                  <Link
                    href="/patient/nurse-request"
                    className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 hover:border-emerald-200 hover:bg-emerald-50"
                  >
                    <MapPin className="h-8 w-8 text-emerald-600" />
                    <span className="font-medium">Request Nurse Visit</span>
                  </Link>
                  <Link
                    href="/patient/cases"
                    className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 hover:border-blue-200 hover:bg-blue-50"
                  >
                    <FileText className="h-8 w-8 text-blue-600" />
                    <span className="font-medium">My Cases (Eva)</span>
                  </Link>
                  <Link
                    href="/patient/prescriptions"
                    className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 hover:border-blue-200 hover:bg-blue-50"
                  >
                    <FileText className="h-8 w-8 text-blue-600" />
                    <span className="font-medium">My Prescriptions</span>
                  </Link>
                  <Link
                    href="/patient/appointments"
                    className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 hover:border-blue-200 hover:bg-blue-50"
                  >
                    <Calendar className="h-8 w-8 text-blue-600" />
                    <span className="font-medium">Appointments</span>
                  </Link>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-slate-900">Active Nurse Visit</h2>
                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">No active nurse visit.</p>
                  <Link
                    href="/patient/nurse-request"
                    className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline"
                  >
                    Request a nurse →
                  </Link>
                </div>
              </section>
            </>
          )}

          {activeTab === "nurse" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Nurse Visit Status</h2>
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Request a nurse</span>
                    <span className="text-sm text-slate-500">—</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">No active visit.</p>
                  <Link
                    href="/patient/nurse-request"
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                  >
                    <MapPin className="h-4 w-4" />
                    Request Nurse
                  </Link>
                </div>
              </div>
            </section>
          )}

          {activeTab === "contacts" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Emergency Contacts</h2>
              <p className="mt-2 text-sm text-slate-600">
                Contacts notified automatically when you use the emergency button.
              </p>
              <div className="mt-4 space-y-2">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="font-medium">No contacts added</p>
                  <p className="text-sm text-slate-500">Add contacts in settings</p>
                </div>
              </div>
            </section>
          )}

          {activeTab === "reminders" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Health Reminders</h2>
              <p className="mt-4 text-sm text-slate-600">No reminders set.</p>
              <Link href="/patient/reminders" className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline">
                Manage reminders →
              </Link>
            </section>
          )}

          {activeTab === "history" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900">Medical History</h2>
              <p className="mt-1 text-sm text-slate-600">Stored in your account (Supabase).</p>
              <form onSubmit={addMedicalHistory} className="mt-4 flex flex-wrap gap-3">
                <select
                  value={newRecordType}
                  onChange={(e) => setNewRecordType(e.target.value)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm"
                >
                  <option value="diagnosis">Diagnosis</option>
                  <option value="procedure">Procedure</option>
                  <option value="allergy">Allergy</option>
                  <option value="chronic">Chronic</option>
                </select>
                <input
                  type="text"
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Summary"
                  className="flex-1 min-w-[200px] rounded-xl border border-slate-200 px-4 py-2 text-sm"
                />
                <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  Add
                </button>
              </form>
              {historyLoading ? (
                <p className="mt-4 text-sm text-slate-500">Loading…</p>
              ) : medicalHistory.length === 0 ? (
                <p className="mt-4 text-sm text-slate-600">No medical history entries yet.</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {medicalHistory.map((row) => (
                    <li key={row.id} className="rounded-xl border border-slate-200 p-3">
                      <span className="text-xs font-medium text-slate-500 uppercase">{row.record_type ?? "—"}</span>
                      <p className="mt-1 text-sm text-slate-900">{row.summary ?? "—"}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {row.recorded_at ? new Date(row.recorded_at).toLocaleString() : new Date(row.created_at).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {(activeTab === "prescriptions" || activeTab === "appointments") && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900 capitalize">{activeTab}</h2>
              <p className="mt-4 text-sm text-slate-600">No records yet.</p>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="font-semibold text-slate-900">Recent Eva Summary</h3>
            <p className="mt-2 text-sm text-slate-600">No recent diagnosis.</p>
            <Link href="/ai-diagnosis" className="mt-2 text-sm font-medium text-blue-600 hover:underline">
              Talk to Eva →
            </Link>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="font-semibold text-slate-900">Prescription Delivery</h3>
            <p className="mt-2 text-sm text-slate-600">No pending deliveries.</p>
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
              <Truck className="h-4 w-4" />
              Track deliveries when available
            </div>
          </div>
        </div>
      </div>
    </div>
    </SubscriptionGate>
  );
}
