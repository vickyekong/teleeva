"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const ITEMS = [
  {
    q: "What is MedConnect?",
    a: "MedConnect is your one place for AI-powered health guidance, prescriptions, nurse visits, and emergency support. Say \"Hi Eva\" to get started, track prescriptions, and connect with licensed providers — all online.",
  },
  {
    q: "How do I get started?",
    a: "Click \"Get started\" or \"Access the full app\" to enter the app. From there you can speak to Eva for symptom guidance, subscribe to a plan, or sign up as a provider. No commitment required to explore.",
  },
  {
    q: "Is my information secure?",
    a: "Yes. We use HIPAA-style privacy practices and role-based access. Your data is protected and only shared with care teams when you choose to use a service.",
  },
  {
    q: "What’s included in a subscription?",
    a: "Plans include access to Eva (AI assistant), prescription tracking, and support. Care and Family plans add nurse visits, HMO integration, and more. Check the Prices section above for full details.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {ITEMS.map((item, i) => (
        <div
          key={i}
          className="rounded-xl border border-[#e7e5e4] bg-white overflow-hidden"
        >
          <button
            type="button"
            onClick={() => setOpen(open === i ? -1 : i)}
            className="flex w-full items-center justify-between px-5 py-4 text-left text-[#1c1917] hover:bg-[#fafaf9] transition"
            aria-expanded={open === i}
          >
            <span className="font-semibold">{item.q}</span>
            <ChevronDown
              className={`h-5 w-5 shrink-0 text-[#78716c] transition ${open === i ? "rotate-180" : ""}`}
            />
          </button>
          {open === i && (
            <div className="border-t border-[#e7e5e4] px-5 py-4 text-[#57534e] leading-relaxed">
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
