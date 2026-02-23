import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const diagnosisRequestId = body.diagnosis_request_id ?? null;
    const patientId = body.patient_id;
    const medications = Array.isArray(body.medications) ? body.medications : [];

    if (!patientId || typeof patientId !== "string") {
      return NextResponse.json(
        { error: "patient_id is required" },
        { status: 400 }
      );
    }

    const normalizedMedications = medications.map((m: unknown) => {
      const x = m as Record<string, unknown>;
      return {
        name: typeof x?.name === "string" ? x.name : "Unknown",
        dosage: typeof x?.dosage === "string" ? x.dosage : "",
        notes: x?.notes != null ? String(x.notes) : undefined,
      };
    });

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
        { error: "Only doctors can create prescriptions" },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from("prescriptions")
      .insert({
        diagnosis_request_id: diagnosisRequestId || null,
        patient_id: patientId,
        doctor_id: user.id,
        medications: normalizedMedications,
        status: "draft",
      })
      .select("id, patient_id, diagnosis_request_id, status, created_at")
      .single();

    if (error) {
      console.error("[doctor/prescriptions]", error);
      return NextResponse.json(
        { error: error.message || "Create failed" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[doctor/prescriptions]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Create failed" },
      { status: 500 }
    );
  }
}
