import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { DiagnosisResult, RiskLevel } from "@/types";

const RISK_LEVELS: RiskLevel[] = ["mild", "moderate", "emergency"];

const SYSTEM_PROMPT = `You are an AI medical triage assistant.

Your job:
1. Carefully analyze the symptoms.
2. Suggest possible conditions.
3. Explain reasoning clearly.
4. Give safe preliminary advice.
5. Ask follow-up questions if needed.

Always vary responses based on symptoms.
Do NOT give identical generic responses.
Keep answers specific and practical.

You must respond with a JSON object only (no markdown, no extra text) in this exact shape so the app can parse it:
{
  "riskLevel": "mild" | "moderate" | "emergency",
  "confidence": number (0-100),
  "conditions": [{ "name": "string", "confidence": number }],
  "medications": [{ "name": "string", "dosage": "string", "notes": "string" }],
  "disclaimer": "string"
}

riskLevel: use "emergency" only for symptoms suggesting heart attack, stroke, severe allergic reaction, major trauma, difficulty breathing, or similar. Use "moderate" for concerning but not immediately life-threatening. Use "mild" otherwise. Always include a short disclaimer that this is not a substitute for professional medical advice. Output only the JSON object.`;

function parseRiskLevel(s: string): RiskLevel {
  const lower = s?.toLowerCase() ?? "";
  if (RISK_LEVELS.includes(lower as RiskLevel)) return lower as RiskLevel;
  if (lower.includes("emergency")) return "emergency";
  if (lower.includes("moderate")) return "moderate";
  return "mild";
}

function parseJsonFromContent(content: string): Record<string, unknown> | null {
  const trimmed = content.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const symptoms = typeof body.symptoms === "string" ? body.symptoms.trim() : "";
    const sessionId = typeof body.sessionId === "string" ? body.sessionId : undefined;

    if (!symptoms) {
      return NextResponse.json(
        { error: "symptoms is required" },
        { status: 400 }
      );
    }

    const openai = getOpenAIClient();
    if (!openai) {
      return NextResponse.json(
        { error: "OpenAI is not configured. Set OPENAI_API_KEY in .env.local." },
        { status: 503 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Patient symptoms: ${symptoms}` },
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const parsed = parseJsonFromContent(raw);
    if (!parsed) {
      return NextResponse.json(
        { error: "AI response could not be parsed", raw: raw.slice(0, 200) },
        { status: 502 }
      );
    }

    const riskLevel = parseRiskLevel(String(parsed.riskLevel ?? "mild"));
    const confidence = Math.min(100, Math.max(0, Number(parsed.confidence) || 70));
    const conditions = Array.isArray(parsed.conditions)
      ? (parsed.conditions as Record<string, unknown>[]).map((c) => ({
          name: String(c?.name ?? "Unknown"),
          confidence: typeof c?.confidence === "number" ? c.confidence : undefined,
        }))
      : [];
    const medications = Array.isArray(parsed.medications)
      ? (parsed.medications as Record<string, unknown>[]).map((m) => ({
          name: String(m?.name ?? "Unknown"),
          dosage: String(m?.dosage ?? ""),
          notes: m?.notes != null ? String(m.notes) : undefined,
        }))
      : [];
    const disclaimer =
      typeof parsed.disclaimer === "string"
        ? parsed.disclaimer
        : "This is not a substitute for professional medical advice. Please consult a healthcare provider.";

    const result: DiagnosisResult = {
      requestId: `req-${Date.now()}${sessionId ? `-${sessionId.slice(0, 8)}` : ""}`,
      riskLevel,
      confidence,
      conditions,
      medications,
      disclaimer,
    };

    let saved = false;
    try {
      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: patient } = await supabase
          .from("patients")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        if (patient?.id) {
          const { error: insertError } = await supabase
            .from("diagnosis_requests")
            .insert({
              patient_id: patient.id,
              session_id: sessionId ?? null,
              symptoms_text: symptoms,
              ai_risk_level: riskLevel,
              ai_confidence: confidence,
              ai_conditions: conditions,
              ai_medications: medications,
              status: "AI_ANALYSIS",
            });
          if (!insertError) saved = true;
        }
      }
    } catch (saveErr) {
      console.warn("[diagnosis/analyze] Supabase save failed:", saveErr);
    }

    return NextResponse.json({ ...result, saved });
  } catch (err) {
    console.error("[diagnosis/analyze]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
