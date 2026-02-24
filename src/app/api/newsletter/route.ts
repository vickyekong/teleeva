import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert({ email }, { onConflict: "email" });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { message: "You're already subscribed. Thank you!" },
          { status: 200 }
        );
      }
      console.error("[newsletter]", error);
      return NextResponse.json(
        { error: "Subscription failed. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Thanks for subscribing!" });
  } catch (err) {
    console.error("[newsletter]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
