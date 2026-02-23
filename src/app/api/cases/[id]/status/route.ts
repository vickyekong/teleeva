import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { DiagnosisRequestStatus } from "@/lib/supabase/database.types";

const PROVIDER_ROLES = ["doctor", "pharmacist", "admin", "dispatcher", "nurse"] as const;
const STATUSES_REQUIRING_REVIEWED_AT: DiagnosisRequestStatus[] = [
  "DOCTOR_APPROVED",
  "COMPLETED",
  "approved",
  "PHARMACY_CONFIRMED",
  "READY_FOR_DISPATCH",
];
const STATUSES_SET_DISPATCHER: DiagnosisRequestStatus[] = ["DISPATCH_ASSIGNED"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Case ID required" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const status = typeof body.status === "string" ? body.status.trim() : "";
    if (!status) {
      return NextResponse.json(
        { error: "status is required in body" },
        { status: 400 }
      );
    }

    const allowed: DiagnosisRequestStatus[] = [
      "pending",
      "pharmacist_review",
      "approved",
      "modified",
      "escalated",
      "AI_ANALYSIS",
      "PENDING_DOCTOR_REVIEW",
      "DOCTOR_APPROVED",
      "COMPLETED",
      "PENDING_PHARMACY",
      "PHARMACY_CONFIRMED",
      "READY_FOR_DISPATCH",
      "DISPATCH_ASSIGNED",
      "IN_TRANSIT",
      "DELIVERED",
      "NURSE_REQUESTED",
      "NURSE_ASSIGNED",
      "NURSE_EN_ROUTE",
      "NURSE_IN_PROGRESS",
      "NURSE_COMPLETED",
    ];
    if (!allowed.includes(status as DiagnosisRequestStatus)) {
      return NextResponse.json(
        { error: "Invalid status value" },
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

    const role = (profile?.role as string) ?? "";
    if (!PROVIDER_ROLES.includes(role as (typeof PROVIDER_ROLES)[number])) {
      return NextResponse.json(
        { error: "Only doctors, pharmacists, dispatchers, or admins can update case status" },
        { status: 403 }
      );
    }

    const update: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (STATUSES_REQUIRING_REVIEWED_AT.includes(status as DiagnosisRequestStatus)) {
      update.reviewed_at = new Date().toISOString();
      update.pharmacist_id = user.id;
    }
    if (STATUSES_SET_DISPATCHER.includes(status as DiagnosisRequestStatus)) {
      update.dispatcher_id = user.id;
    }

    const { data, error } = await supabase
      .from("diagnosis_requests")
      .update(update)
      .eq("id", id)
      .select("id, status, updated_at, reviewed_at, dispatcher_id")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Case not found" }, { status: 404 });
      }
      console.error("[cases/status]", error);
      return NextResponse.json(
        { error: error.message || "Update failed" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[cases/status]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 500 }
    );
  }
}
