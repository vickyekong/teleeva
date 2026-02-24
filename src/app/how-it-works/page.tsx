import Link from "next/link";
import {
  MessageCircle,
  FileSearch,
  Stethoscope,
  Pill,
  Truck,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { BRAND_NAME, AI_NAME } from "@/lib/constants";

const STEPS = [
  {
    step: 1,
    title: "Describe your symptoms",
    body: `Start a conversation with ${AI_NAME}, our AI health assistant. Tell her what you're feeling — she guides you through questions and gathers relevant details in plain language.`,
    icon: MessageCircle,
    color: "bg-[#ccfbf1] text-[#0d9488]",
  },
  {
    step: 2,
    title: "AI analysis & risk level",
    body: `${AI_NAME} analyzes your input and provides an initial assessment with a risk level. This helps prioritize your case and prepare the right level of care.`,
    icon: FileSearch,
    color: "bg-[#e0e7ff] text-[#3730a3]",
  },
  {
    step: 3,
    title: "Doctor review",
    body: "When needed, a licensed doctor reviews your case, confirms or adjusts the assessment, and can approve prescriptions or request a nurse visit.",
    icon: Stethoscope,
    color: "bg-[#dcfce7] text-[#15803d]",
  },
  {
    step: 4,
    title: "Prescription & pharmacy",
    body: "If a prescription is appropriate, it's sent to a pharmacist for verification. Once confirmed, your medications are prepared for pickup or delivery.",
    icon: Pill,
    color: "bg-[#fef3c7] text-[#b45309]",
  },
  {
    step: 5,
    title: "Delivery or nurse visit",
    body: "Medications can be delivered to your address, or a nurse can be scheduled for an at-home visit when that's the right option for your care.",
    icon: Truck,
    color: "bg-[#fce7f3] text-[#be185d]",
  },
  {
    step: 6,
    title: "Care completed",
    body: "Your case is updated through to completion. You can track prescriptions and visits in the app and return anytime for follow-up or new concerns.",
    icon: CheckCircle,
    color: "bg-[#ccfbf1] text-[#0d9488]",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1c1917]">
      <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          How {BRAND_NAME} works
        </h1>
        <p className="mt-4 text-lg text-[#57534e]">
          From your first symptom to treatment delivery — one connected workflow.
        </p>

        <div className="mt-14 space-y-12">
          {STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="flex gap-6 rounded-2xl border border-[#e7e5e4] bg-white p-6 shadow-sm"
              >
                <div className="flex shrink-0 items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#0d9488] bg-[#f0fdfa] text-lg font-bold text-[#0d9488]">
                    {item.step}
                  </span>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-semibold text-[#1c1917]">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-[#57534e] leading-relaxed">{item.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 rounded-2xl border border-[#e7e5e4] bg-[#f0fdfa] p-8 text-center">
          <h2 className="text-xl font-semibold text-[#1c1917]">
            Ready to get started?
          </h2>
          <p className="mt-2 text-[#57534e]">
            Create an account, choose a plan, and access {AI_NAME} and the full care journey.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/subscribe"
              className="inline-flex items-center gap-2 rounded-full bg-[#0d9488] px-6 py-3 font-semibold text-white hover:bg-[#0f766e]"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center rounded-full border-2 border-[#0d9488] px-6 py-3 font-semibold text-[#0d9488] hover:bg-[#f0fdfa]"
            >
              Access app
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
