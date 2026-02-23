import Link from "next/link";
import {
  Stethoscope,
  Pill,
  Building2,
  MapPin,
  Truck,
  UserCircle,
  ClipboardList,
  ArrowRight,
  UserPlus,
  ShieldAlert,
} from "lucide-react";
import { BRAND_NAME } from "@/lib/constants";

const PROVIDER_ROLES = [
  {
    icon: MapPin,
    title: "Nurse",
    href: "/nurse",
    desc: "Visit requests, patient location & AI summary, accept jobs and update status.",
    color: "emerald",
  },
  {
    icon: Stethoscope,
    title: "Doctor",
    href: "/doctor",
    desc: "Consultations, patient charts, prescriptions, and care team collaboration.",
    color: "blue",
  },
  {
    icon: UserCircle,
    title: "Pharmacist",
    href: "/pharmacist",
    desc: "Review and approve prescriptions, manage queue, escalate or dispatch.",
    color: "violet",
  },
  {
    icon: Building2,
    title: "Pharmacy",
    href: "/pharmacy",
    desc: "Orders, inventory, verify prescriptions, and fulfill medication requests.",
    color: "amber",
  },
  {
    icon: Truck,
    title: "Dispatch",
    href: "/dispatch",
    desc: "Track deliveries, update status, and manage medication logistics.",
    color: "slate",
  },
  {
    icon: ShieldAlert,
    title: "Admin",
    href: "/admin",
    desc: "Emergency alerts in real time, assign responders, and resolve incidents.",
    color: "red",
  },
] as const;

const colorClasses = {
  emerald:
    "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600",
  blue: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600",
  violet:
    "bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-600 hover:text-white hover:border-violet-600",
  amber:
    "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-600 hover:text-white hover:border-amber-600",
  slate:
    "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-600 hover:text-white hover:border-slate-600",
  red:
    "bg-red-100 text-red-700 border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600",
};

export default function ProviderPortalPage() {
  return (
    <div className="provider-portal">
      {/* Header */}
      <div className="mb-10 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100/80 p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Provider portal</h1>
            <p className="mt-2 text-slate-600">
              One hub for nurses, doctors, pharmacists, pharmacy, and dispatch. Pick your role and go to your workspace.
            </p>
          </div>
          <img
            src="https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&q=80"
            alt="Healthcare providers"
            className="h-28 w-full rounded-xl object-cover sm:h-24 sm:w-44"
          />
        </div>
      </div>

      {/* Role cards */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Your workspace</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROVIDER_ROLES.map((role) => (
            <Link
              key={role.title}
              href={role.href}
              className={`group flex items-start gap-4 rounded-xl border p-5 transition ${colorClasses[role.color]}`}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                <role.icon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold">{role.title}</h3>
                <p className="mt-1 text-sm opacity-90">{role.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium opacity-90">
                  Open
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* HMO + Register */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
            <ClipboardList className="h-5 w-5" />
          </div>
          <h3 className="mt-3 font-semibold text-slate-900">HMO & insurance</h3>
          <p className="mt-1 text-sm text-slate-600">
            Link plans, view approved hospitals, and manage billing.
          </p>
          <Link
            href="/hmo"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline"
          >
            Go to HMO
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200 text-slate-600">
            <UserPlus className="h-5 w-5" />
          </div>
          <h3 className="mt-3 font-semibold text-slate-900">New to {BRAND_NAME}?</h3>
          <p className="mt-1 text-sm text-slate-600">
            Register as a provider to get job requests, build your profile, and earn from your services.
          </p>
          <Link
            href="/marketplace/register"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Register as provider
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <p className="mt-10 text-center text-sm text-slate-500">
        <Link href="/app" className="text-slate-600 hover:underline">Back to {BRAND_NAME}</Link>
      </p>
    </div>
  );
}
