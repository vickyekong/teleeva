import Link from "next/link";
import { MessageCircle, FileText, MapPin, Building2, LayoutDashboard } from "lucide-react";
import { BRAND_NAME, AI_NAME } from "@/lib/constants";
import SubscriptionGate from "@/components/patient/SubscriptionGate";

const actions = [
  {
    icon: MessageCircle,
    title: `Speak to ${AI_NAME}`,
    desc: "Describe your symptoms and get guidance. Say or type \"Hi Eva\" to start.",
    href: "/ai-diagnosis",
    primary: true,
  },
  {
    icon: LayoutDashboard,
    title: "My dashboard",
    desc: "Your health overview, prescriptions, appointments, and nurse visit status.",
    href: "/patient/dashboard",
  },
  {
    icon: FileText,
    title: "My prescriptions",
    desc: "Track prescriptions and medication delivery.",
    href: "/patient/prescriptions",
  },
  {
    icon: MapPin,
    title: "Request a nurse",
    desc: "Get a nurse visit at your location with real-time tracking.",
    href: "/patient/nurse-request",
  },
  {
    icon: Building2,
    title: "HMO & insurance",
    desc: "Link your plan, view coverage, and approved hospitals.",
    href: "/hmo",
  },
];

export default function PatientPortalPage() {
  return (
    <SubscriptionGate>
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patient portal</h1>
          <p className="mt-1 text-slate-600">
            Your entry point to {BRAND_NAME}. Talk to Eva, manage your care, and access your dashboard.
          </p>
        </div>
        <img
          src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&q=80"
          alt="Patient care"
          className="h-24 w-full rounded-xl object-cover sm:h-20 sm:w-48"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((a) => (
          <Link
            key={a.title}
            href={a.href}
            className={`group rounded-2xl border p-6 transition-all hover:shadow-md ${
              a.primary
                ? "border-blue-300 bg-blue-50/50 hover:border-blue-400"
                : "border-slate-200 bg-white hover:border-blue-200"
            }`}
          >
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${
              a.primary ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
            }`}>
              <a.icon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{a.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{a.desc}</p>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-slate-500">
        <Link href="/patient/dashboard" className="text-blue-600 hover:underline">My dashboard</Link>
      </p>
    </div>
    </SubscriptionGate>
  );
}
