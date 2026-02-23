"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Stethoscope } from "lucide-react";
import { setPatientSubscribed } from "@/lib/subscription";

const plans = [
  {
    name: "Basic",
    price: 9,
    period: "month",
    features: ["Eva virtual assistant", "Prescription tracking", "Basic support"],
  },
  {
    name: "Care",
    price: 19,
    period: "month",
    popular: true,
    features: ["Everything in Basic", "Nurse visits (discounted)", "HMO integration", "Priority support"],
  },
  {
    name: "Family",
    price: 39,
    period: "month",
    features: ["Everything in Care", "Up to 5 family members", "Chronic care monitoring", "24/7 support"],
  },
];

export default function SubscribePage() {
  const router = useRouter();

  const handleSubscribe = (planName: string) => {
    setPatientSubscribed();
    router.push("/patient-portal");
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-slate-100">
        <img
          src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&q=80"
          alt="Healthcare and wellness"
          className="h-48 w-full object-cover sm:h-56"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-2xl font-bold text-slate-900">Subscribe to MedConnect</h1>
          <p className="mt-1 text-slate-700">
            Sign up, choose a plan, and pay to get access to the patient portal — Eva, your dashboard, prescriptions, and nurse visits.
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl border p-6 ${
              plan.popular ? "border-blue-600 bg-blue-50/50" : "border-slate-200 bg-white"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-medium text-white">
                Popular
              </span>
            )}
            <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
            <p className="mt-2">
              <span className="text-3xl font-bold text-slate-900">${plan.price}</span>
              <span className="text-slate-600">/{plan.period}</span>
            </p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                  <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe(plan.name)}
              className={`mt-6 w-full rounded-xl py-3 font-semibold ${
                plan.popular
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Subscribe
            </button>
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-slate-500">
        Already subscribed? <Link href="/patient-portal" className="text-blue-600 hover:underline">Go to patient portal</Link> or <Link href="/login" className="text-blue-600 hover:underline">Sign in</Link>.
      </p>
    </div>
  );
}
