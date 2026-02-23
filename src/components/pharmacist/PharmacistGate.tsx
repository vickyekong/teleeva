"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pill, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function PharmacistGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (profile && profile.role !== "pharmacist") {
      router.replace("/provider-portal");
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!profile) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (profile.role !== "pharmacist") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <Pill className="h-8 w-8 text-slate-500" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-slate-900">Pharmacist access only</h2>
        <p className="mt-2 text-slate-600">
          This dashboard is for pharmacists. Use the provider portal to open your role workspace.
        </p>
        <Link
          href="/provider-portal"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-800 px-6 py-3 font-semibold text-white hover:bg-slate-700"
        >
          Provider portal
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
