import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const patientId = body.patientId ?? null;
    const lat = body.lat != null ? Number(body.lat) : null;
    const lng = body.lng != null ? Number(body.lng) : null;
    const address =
      typeof body.address === "string" ? body.address.trim() || null : null;
    const diagnosisRequestId = body.diagnosisRequestId ?? null;
    const medicalHistorySnapshot =
      body.medicalHistorySnapshot != null ? body.medicalHistorySnapshot : null;

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const insert: Record<string, unknown> = {
      patient_id: patientId,
      diagnosis_request_id: diagnosisRequestId,
      latitude: lat,
      longitude: lng,
      address_snapshot: address,
      medical_history_snapshot: medicalHistorySnapshot,
      status: "EMERGENCY_TRIGGERED",
    };

    const { data, error } = await supabase
      .from("emergency_alerts")
      .insert(insert)
      .select("id, status, created_at")
      .single();

    if (error) {
      console.error("[emergency/alert]", error);
      return NextResponse.json(
        { error: error.message || "Create failed" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[emergency/alert]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Create failed" },
      { status: 500 }
    );
  }
}
