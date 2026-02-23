/**
 * AI diagnosis API service.
 * Calls /api/diagnosis/analyze (same origin or NEXT_PUBLIC_API_URL); falls back to symptom-aware mock if unavailable.
 */

import type { DiagnosisResult, RiskLevel } from "@/types";
import { apiRequest } from "./client";

export interface AnalyzeSymptomsInput {
  symptoms: string;
  sessionId?: string;
}

export interface DiagnosisResultWithFallback extends DiagnosisResult {
  /** True when the real API failed and a mock was returned */
  _fallback?: boolean;
}

const ANALYZE_PATH = "/api/diagnosis/analyze";

export async function analyzeSymptoms(
  input: AnalyzeSymptomsInput
): Promise<DiagnosisResultWithFallback> {
  try {
    const result = await apiRequest<DiagnosisResult>(ANALYZE_PATH, {
      method: "POST",
      body: JSON.stringify(input),
    });
    return { ...result, _fallback: false };
  } catch {
    return mockAnalyze(input.symptoms);
  }
}

/** Derive a symptom-aware mock so different symptoms produce different-looking responses when API is down */
function mockAnalyze(symptoms: string): Promise<DiagnosisResultWithFallback> {
  const s = symptoms.toLowerCase();
  let riskLevel: RiskLevel = "mild";
  let conditions: { name: string; confidence: number }[];
  let medications: { name: string; dosage: string; notes?: string }[];

  if (/\b(chest pain|breathing|shortness of breath|stroke|heart|collapse|severe pain|allergic|swelling|throat clos)\b/.test(s)) {
    riskLevel = "emergency";
    conditions = [{ name: "Possible emergency – seek care now", confidence: 90 }];
    medications = [{ name: "None – call emergency services", dosage: "—", notes: "Do not delay." }];
  } else if (/\b(fever|infection|vomit|blood|persistent pain|worsening)\b/.test(s)) {
    riskLevel = "moderate";
    conditions = [{ name: "Possible infection or concerning symptoms", confidence: 65 }, { name: "Needs clinical assessment", confidence: 70 }];
    medications = [{ name: "Avoid self-medicating; see a provider", dosage: "—", notes: "Assessment recommended." }];
  } else if (/\b(headache|head)\b/.test(s) && !/\b(fever|vision|confusion|sudden)\b/.test(s)) {
    conditions = [{ name: "Tension-type headache", confidence: 72 }, { name: "Possible migraine", confidence: 55 }];
    medications = [
      { name: "Paracetamol / Acetaminophen", dosage: "500mg", notes: "Up to 4x daily as needed" },
      { name: "Rest, hydration", dosage: "—", notes: "If severe or recurring, see a doctor." },
    ];
  } else if (/\b(stomach|belly|abdominal|nausea|diarrhea)\b/.test(s)) {
    conditions = [{ name: "Gastrointestinal upset", confidence: 68 }, { name: "Possible viral gastroenteritis", confidence: 55 }];
    medications = [
      { name: "Oral rehydration", dosage: "As needed", notes: "Small frequent sips" },
      { name: "Avoid heavy meals", dosage: "—", notes: "If severe or bloody stool, seek care." },
    ];
  } else if (/\b(cough|throat|sore throat|cold)\b/.test(s)) {
    conditions = [{ name: "Upper respiratory / common cold", confidence: 75 }, { name: "Mild viral infection", confidence: 65 }];
    medications = [
      { name: "Paracetamol", dosage: "500mg", notes: "2 tablets up to 4x daily" },
      { name: "Throat lozenges", dosage: "As needed", notes: "For sore throat" },
    ];
  } else if (/\b(tired|fatigue|weak|dizzy)\b/.test(s)) {
    conditions = [{ name: "Fatigue / low energy", confidence: 70 }, { name: "Possible dehydration or sleep-related", confidence: 60 }];
    medications = [
      { name: "Rest and hydration", dosage: "—", notes: "Consider sleep and stress." },
      { name: "If prolonged or severe", dosage: "—", notes: "See a healthcare provider." },
    ];
  } else {
    conditions = [{ name: "General symptoms – assessment needed", confidence: 60 }];
    medications = [{ name: "Consult a healthcare provider for your specific symptoms", dosage: "—", notes: "Personalized advice required." }];
  }

  return Promise.resolve({
    requestId: `req-${Date.now()}-mock`,
    riskLevel,
    confidence: 72,
    conditions,
    medications,
    disclaimer: "This is a sample response because Eva could not be reached. It is not a substitute for professional medical advice. Please consult a healthcare provider.",
    _fallback: true,
  });
}
