"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, Stethoscope } from "lucide-react";
import { isPatientSubscribed } from "@/lib/subscription";

export default function SubscriptionGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [subscribed, setSubscribed] = useState<boolean | null>(null);

  useEffect(() => {
    setSubscribed(isPatientSubscribed());
  }, []);

  if (subscribed === null) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!subscribed) {
    return (
      <div className="mx-auto max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white text-center shadow-sm">
        <img
          src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80"
          alt=""
          className="h-40 w-full object-cover"
        />
        <div className="p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <Lock className="h-8 w-8 text-amber-600" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-slate-900">Subscribe to access the patient portal</h2>
        <p className="mt-2 text-slate-600">
          Sign up and pay for a plan to access Eva, your dashboard, prescriptions, nurse visits, and more.
        </p>
        <Link
          href="/subscribe"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          <Stethoscope className="h-5 w-5" />
          View plans & subscribe
        </Link>
        <p className="mt-4 text-sm text-slate-500">
          <Link href="/" className="text-blue-600 hover:underline">Back to home</Link>
        </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
