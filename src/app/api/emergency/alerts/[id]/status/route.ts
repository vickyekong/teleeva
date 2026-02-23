import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const ALLOWED_STATUSES = ["RESPONDER_ASSIGNED", "RESOLVED"] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Alert ID required" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const status = typeof body.status === "string" ? body.status.trim() : "";
    if (!status || !ALLOWED_STATUSES.includes(status as (typeof ALLOWED_STATUSES)[number])) {
      return NextResponse.json(
        { error: "status must be RESPONDER_ASSIGNED or RESOLVED" },
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
    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can update emergency alert status" },
        { status: 403 }
      );
    }

    const update: Record<string, unknown> = { status };
    if (status === "RESPONDER_ASSIGNED") {
      update.responder_id = user.id;
      update.responded_at = new Date().toISOString();
    }
    if (status === "RESOLVED") {
      update.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("emergency_alerts")
      .update(update)
      .eq("id", id)
      .select("id, status, responder_id, responded_at, resolved_at")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Alert not found" }, { status: 404 });
      }
      console.error("[emergency/alerts/status]", error);
      return NextResponse.json(
        { error: error.message || "Update failed" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[emergency/alerts/status]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 500 }
    );
  }
}
