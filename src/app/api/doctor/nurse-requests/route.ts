import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const patientId = body.patient_id;
    const reason = typeof body.reason === "string" ? body.reason.trim() : null;
    const address = typeof body.address === "string" ? body.address.trim() : null;
    const diagnosisRequestId = body.diagnosis_request_id ?? null;

    if (!patientId || typeof patientId !== "string") {
      return NextResponse.json(
        { error: "patient_id is required" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "doctor") {
      return NextResponse.json(
        { error: "Only doctors can request nurse visits" },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from("treatment_requests")
      .insert({
        patient_id: patientId,
        reason: reason || null,
        address_or_lat_lng: address || null,
        diagnosis_request_id: diagnosisRequestId || null,
        requested_by_doctor_id: user.id,
        status: "pending",
      })
      .select("id, patient_id, reason, status, created_at, diagnosis_request_id")
      .single();

    if (error) {
      console.error("[doctor/nurse-requests]", error);
      return NextResponse.json(
        { error: error.message || "Create failed" },
        { status: 500 }
      );
    }

    if (diagnosisRequestId && data?.diagnosis_request_id) {
      await supabase
        .from("diagnosis_requests")
        .update({
          status: "NURSE_REQUESTED",
          updated_at: new Date().toISOString(),
        })
        .eq("id", diagnosisRequestId);
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[doctor/nurse-requests]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Create failed" },
      { status: 500 }
    );
  }
}
