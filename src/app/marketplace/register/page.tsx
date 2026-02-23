"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Pill, Stethoscope, Building2, FlaskConical } from "lucide-react";

const roles = [
  { id: "nurse", label: "Nurse", icon: MapPin },
  { id: "pharmacist", label: "Pharmacist", icon: Pill },
  { id: "doctor", label: "Doctor", icon: Stethoscope },
  { id: "hospital", label: "Hospital", icon: Building2 },
  { id: "lab", label: "Lab", icon: FlaskConical },
];

const ROLE_REDIRECT: Record<string, string> = {
  doctor: "/doctor",
  nurse: "/nurse",
  pharmacist: "/pharmacist",
  pharmacy: "/pharmacy",
  hospital: "/doctor",
  lab: "/provider-portal",
};

export default function RegisterProviderPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const redirect = ROLE_REDIRECT[role] || "/provider-portal";
    setTimeout(() => router.push(redirect), 1500);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Register as Provider</h1>
      <p className="mb-6 text-slate-600">
        Join the marketplace. Get job requests, build your profile, and earn from your services.
      </p>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Role</label>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-left ${
                    role === r.id ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <r.icon className="h-5 w-5" />
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Business / Full Name</label>
            <input type="text" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input type="email" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">License / Certification (optional)</label>
            <input type="text" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3" placeholder="License number" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Service Fee (per visit / order)</label>
            <input type="number" placeholder="0.00" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3" />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Register
          </button>
        </form>
      ) : (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-900">Registration Submitted</h2>
          <p className="mt-2 text-slate-600">We'll verify your credentials and activate your profile soon.</p>
          <p className="mt-3 text-sm text-slate-500">Taking you to your portal...</p>
          <Link href={ROLE_REDIRECT[role] || "/provider-portal"} className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700">
            Go to my portal
          </Link>
        </div>
      )}
    </div>
  );
}
