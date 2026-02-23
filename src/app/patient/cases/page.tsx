"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";
import SubscriptionGate from "@/components/patient/SubscriptionGate";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { RISK_LEVELS } from "@/lib/constants";
import type { DiagnosisRequest } from "@/lib/supabase/database.types";

export default function PatientCasesPage() {
  const { patientId, user } = useAuth();
  const [cases, setCases] = useState<DiagnosisRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase
      .from("diagnosis_requests")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error) setCases((data as DiagnosisRequest[]) ?? []);
        setLoading(false);
      });
  }, [patientId]);

  return (
    <SubscriptionGate>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My cases</h1>
            <p className="mt-1 text-slate-600">
              AI diagnosis cases linked to your account. Sign in to see saved cases.
            </p>
          </div>
          <Link
            href="/patient/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </div>

        {loading ? (
          <p className="text-slate-500">Loading cases…</p>
        ) : !user || !patientId ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-slate-600">Sign in as a patient to see your saved diagnosis cases.</p>
            <Link href="/login" className="mt-4 inline-block rounded-xl bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700">
              Sign in
            </Link>
          </div>
        ) : cases.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-slate-600">No cases yet. Describe symptoms in Talk to Eva to create one.</p>
            <Link href="/ai-diagnosis" className="mt-4 inline-block text-blue-600 hover:underline">
              Go to Eva →
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {cases.map((c) => (
              <li
                key={c.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-500">
                    {new Date(c.created_at).toLocaleString()}
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
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    {c.status}
                  </span>
                </div>
                <p className="mt-2 font-medium text-slate-900">{c.symptoms_text.slice(0, 120)}{c.symptoms_text.length > 120 ? "…" : ""}</p>
                {c.ai_confidence != null && (
                  <p className="mt-1 text-sm text-slate-600">Confidence: {c.ai_confidence}%</p>
                )}
                {Array.isArray(c.ai_conditions) && c.ai_conditions.length > 0 && (
                  <p className="mt-2 text-sm text-slate-600">
                    Conditions: {(c.ai_conditions as { name?: string }[]).map((x) => x.name).filter(Boolean).join(", ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </SubscriptionGate>
  );
}
