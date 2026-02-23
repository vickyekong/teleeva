"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type Status = "checking" | "connected" | "error";

export default function TestSupabasePage() {
  const [status, setStatus] = useState<Status>("checking");
  const [message, setMessage] = useState<string>("");
  const [details, setDetails] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        if (!cancelled) {
          setStatus("error");
          setMessage("Supabase client not available");
          setDetails(
            "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env.local. Restart the dev server after adding them."
          );
        }
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        if (cancelled) return;
        if (error) {
          setStatus("error");
          setMessage("Connection failed");
          setDetails(error.message);
          return;
        }
        setStatus("connected");
        setMessage("Connected to Supabase");
        setDetails(
          data.session
            ? "Session active (user signed in)."
            : "No active session (anonymous). Connection to your project is working."
        );
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setMessage("Connection failed");
          setDetails(err instanceof Error ? err.message : String(err));
        }
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Supabase connection test</h1>
      <p className="mt-2 text-slate-600">
        This page checks that the MedConnect app can reach your Supabase project.
      </p>

      <div
        className={`mt-8 rounded-xl border-2 p-6 ${
          status === "checking"
            ? "border-amber-200 bg-amber-50"
            : status === "connected"
              ? "border-emerald-200 bg-emerald-50"
              : "border-red-200 bg-red-50"
        }`}
      >
        {status === "checking" && (
          <p className="font-medium text-amber-800">Checking connection…</p>
        )}
        {status === "connected" && (
          <>
            <p className="font-semibold text-emerald-800">{message}</p>
            <p className="mt-2 text-sm text-emerald-700">{details}</p>
          </>
        )}
        {status === "error" && (
          <>
            <p className="font-semibold text-red-800">{message}</p>
            <p className="mt-2 text-sm text-red-700">{details}</p>
          </>
        )}
      </div>

      <p className="mt-8 text-center text-sm text-slate-500">
        <Link href="/" className="text-[#0d9488] hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  );
}
