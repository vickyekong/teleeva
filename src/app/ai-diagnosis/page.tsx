"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, Mic, AlertTriangle } from "lucide-react";
import { RISK_LEVELS, AI_NAME } from "@/lib/constants";
import { analyzeSymptoms } from "@/services/api/diagnosis";
import type { DiagnosisResult } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type Message = {
  role: "user" | "assistant";
  content: string;
  riskLevel?: keyof typeof RISK_LEVELS;
  confidence?: number;
  conditions?: { name: string; confidence?: number }[];
  medications?: { name: string; dosage: string; notes?: string }[];
  /** Shown when the real API failed and a symptom-based sample was used */
  isFallback?: boolean;
};

function isHiEva(text: string): boolean {
  const normalized = text.trim().toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ");
  return normalized === "hi eva" || normalized.startsWith("hi eva ");
}

function stripHiEva(text: string): string {
  const t = text.trim();
  const lower = t.toLowerCase();
  if (lower.startsWith("hi eva")) return t.slice(lower.indexOf("hi eva") + 6).trim();
  return t;
}

function formatDiagnosisContent(result: DiagnosisResult): string {
  const conditions = result.conditions.length
    ? result.conditions.map((c) => `${c.name}${c.confidence != null ? ` (${c.confidence}%)` : ""}`).join(", ")
    : "—";
  const meds = result.medications.length
    ? result.medications.map((m) => `• ${m.name} ${m.dosage}${m.notes ? ` — ${m.notes}` : ""}`).join("\n")
    : "—";
  return `**Possible conditions:** ${conditions}\n\n**Risk level:** ${result.riskLevel}\n**Confidence:** ${result.confidence}%\n\n**Preliminary prescription:**\n${meds}\n\n${result.disclaimer ?? ""}`;
}

export default function AIDiagnosisPage() {
  const { patientId } = useAuth();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi! I'm ${AI_NAME}, your medical assistant. Say or type "Hi ${AI_NAME}" anytime to talk to me, then describe your symptoms (e.g. headache, fever, pain) and I'll suggest possible conditions, treatments, and a preliminary prescription. For emergencies, use the red emergency button.`,
    },
  ]);
  const [loading, setLoading] = useState(false);

  const saveCaseToSupabase = async (symptomsText: string, result: DiagnosisResult) => {
    if (!patientId) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.from("diagnosis_requests").insert({
      patient_id: patientId,
      symptoms_text: symptomsText,
      ai_risk_level: result.riskLevel,
      ai_confidence: result.confidence,
      ai_conditions: result.conditions,
      ai_medications: result.medications,
      status: "AI_ANALYSIS",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((m) => [...m, userMsg]);
    const rawInput = input.trim();
    setInput("");
    setLoading(true);

    if (isHiEva(rawInput)) {
      const greeting: Message = {
        role: "assistant",
        content: `Hi! I'm ${AI_NAME}. How can I help you today? Describe any symptoms you're having (e.g. headache, fever, pain) and I'll give you a preliminary assessment and care suggestions.`,
      };
      setMessages((m) => [...m, greeting]);
      setLoading(false);
      return;
    }

    const symptomsText = stripHiEva(rawInput) || rawInput;
    try {
      const result = await analyzeSymptoms({ symptoms: symptomsText });
      const alreadySaved = (result as { saved?: boolean }).saved === true;
      if (!alreadySaved) await saveCaseToSupabase(symptomsText, result);
      const riskKey = result.riskLevel.toUpperCase() as keyof typeof RISK_LEVELS;
      const assistantMsg: Message = {
        role: "assistant",
        content: formatDiagnosisContent(result),
        riskLevel: riskKey in RISK_LEVELS ? riskKey : "MILD",
        confidence: result.confidence,
        conditions: result.conditions,
        medications: result.medications,
        isFallback: (result as { _fallback?: boolean })._fallback === true,
      };
      setMessages((m) => [...m, assistantMsg]);
    } catch (err) {
      const errorMsg: Message = {
        role: "assistant",
        content: `Sorry, I couldn't analyze that right now. ${err instanceof Error ? err.message : "Please try again or use the emergency button if urgent."}`,
      };
      setMessages((m) => [...m, errorMsg]);
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center gap-4">
        <img
          src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=200&h=200&fit=crop&q=80"
          alt={`${AI_NAME} virtual assistant`}
          className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-blue-100"
        />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Talk to {AI_NAME}</h1>
          <p className="text-slate-600">
            Say or type &quot;Hi {AI_NAME}&quot; then describe your symptoms. {AI_NAME} analyzes and suggests conditions, treatments, and prescriptions.
          </p>
          {patientId && (
            <p className="mt-1 text-xs text-slate-500">Your cases are saved to your account.</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex h-[50vh] min-h-[300px] flex-col overflow-hidden sm:h-[60vh]">
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {msg.isFallback && (
                    <p className="mb-2 text-xs font-medium text-amber-700">Sample response — Eva could not be reached. Try again or use a stable connection.</p>
                  )}
                  <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                  {msg.riskLevel && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${RISK_LEVELS[msg.riskLevel].bg} ${RISK_LEVELS[msg.riskLevel].color}`}
                      >
                        Risk: {RISK_LEVELS[msg.riskLevel].label}
                      </span>
                      {msg.confidence !== undefined && (
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs">
                          Confidence: {msg.confidence}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
                  {AI_NAME} is analyzing…
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 bg-slate-50 p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='Say "Hi Eva" or describe your symptoms...'
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                disabled={loading}
              />
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white p-3 text-slate-600 hover:bg-slate-50"
                aria-label="Voice input"
              >
                <Mic className="h-5 w-5" />
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-blue-600 p-3 text-white hover:bg-blue-700 disabled:opacity-50"
                aria-label="Send"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <Link href="/patient/cases" className="text-sm font-medium text-blue-600 hover:underline">
          View my cases →
        </Link>
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-4 text-amber-800 flex-1 max-w-2xl">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <strong>Medical Disclaimer:</strong> {AI_NAME}&#39;s responses are for informational
            purposes only and do not replace professional medical advice, diagnosis,
            or treatment. Always seek the advice of a qualified healthcare provider.
          </div>
        </div>
      </div>
    </div>
  );
}
