import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { TreatmentRequestStatus } from "@/lib/supabase/database.types";

const NURSE_STATUSES: TreatmentRequestStatus[] = [
  "NURSE_ASSIGNED",
  "NURSE_EN_ROUTE",
  "NURSE_IN_PROGRESS",
  "NURSE_COMPLETED",
];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Treatment request ID required" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const status = typeof body.status === "string" ? body.status.trim() : "";
    if (!status || !NURSE_STATUSES.includes(status as TreatmentRequestStatus)) {
      return NextResponse.json(
        { error: "status must be one of: NURSE_ASSIGNED, NURSE_EN_ROUTE, NURSE_IN_PROGRESS, NURSE_COMPLETED" },
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
    if (profile?.role !== "nurse" && profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Only nurses or admins can update treatment request status" },
        { status: 403 }
      );
    }

    const update: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (status === "NURSE_ASSIGNED") {
      update.assigned_nurse_id = user.id;
      update.assigned_at = new Date().toISOString();
    }
    if (status === "NURSE_COMPLETED") {
      update.completed_at = new Date().toISOString();
    }

    const { data: treatment, error: updateError } = await supabase
      .from("treatment_requests")
      .update(update)
      .eq("id", id)
      .select("id, status, diagnosis_request_id, assigned_nurse_id, assigned_at, completed_at")
      .single();

    if (updateError) {
      if (updateError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Treatment request not found" },
          { status: 404 }
        );
      }
      console.error("[nurse/treatment-requests/status]", updateError);
      return NextResponse.json(
        { error: updateError.message || "Update failed" },
        { status: 500 }
      );
    }

    const diagnosisRequestId = treatment?.diagnosis_request_id as string | null;
    if (diagnosisRequestId) {
      await supabase
        .from("diagnosis_requests")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", diagnosisRequestId);
    }

    return NextResponse.json(treatment);
  } catch (err) {
    console.error("[nurse/treatment-requests/status]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 500 }
    );
  }
}
