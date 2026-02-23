import Link from "next/link";
import { ArrowRight, MessageCircle, Users, Shield, Globe, Building2 } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { BRAND_NAME, AI_NAME } from "@/lib/constants";

const PARTNERS = [
  { name: "Healthcare Systems Alliance", role: "Hospital network partner" },
  { name: "PharmaCare Logistics", role: "Medication delivery partner" },
  { name: "NurseFirst Association", role: "Nursing workforce partner" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1c1917]">
      <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">About {BRAND_NAME}</h1>
        <p className="mt-4 text-lg text-[#57534e]">{BRAND.tagline}</p>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-[#1c1917]">Our mission</h2>
          <p className="mt-3 text-[#57534e] leading-relaxed">{BRAND.mission}</p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-[#1c1917]">Our vision</h2>
          <p className="mt-3 text-[#57534e] leading-relaxed">{BRAND.vision}</p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-[#1c1917]">Our story</h2>
          <p className="mt-3 text-[#57534e] leading-relaxed">{BRAND.story}</p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-[#1c1917]">What we offer</h2>
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-[#e7e5e4] bg-white p-4">
              <h3 className="font-medium text-[#1c1917]">For patients</h3>
              <p className="mt-2 text-sm text-[#57534e]">{BRAND.whatWeOffer.patients}</p>
            </div>
            <div className="rounded-xl border border-[#e7e5e4] bg-white p-4">
              <h3 className="font-medium text-[#1c1917]">For providers</h3>
              <p className="mt-2 text-sm text-[#57534e]">{BRAND.whatWeOffer.providers}</p>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-[#1c1917]">Our values</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {BRAND.values.map((v) => (
              <div key={v.title} className="rounded-xl border border-[#e7e5e4] bg-white p-5">
                <h3 className="font-semibold text-[#1c1917]">{v.title}</h3>
                <p className="mt-2 text-sm text-[#57534e]">{v.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-[#1c1917]">Partners</h2>
          <div className="mt-4 flex flex-wrap gap-4">
            {PARTNERS.map((p) => (
              <div
                key={p.name}
                className="flex items-center gap-3 rounded-xl border border-[#e7e5e4] bg-white px-4 py-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ccfbf1] text-[#0d9488]">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-[#1c1917]">{p.name}</p>
                  <p className="text-sm text-[#78716c]">{p.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-14 flex flex-wrap gap-4">
          <Link
            href="/subscribe"
            className="inline-flex items-center gap-2 rounded-full bg-[#0d9488] px-6 py-3 font-semibold text-white hover:bg-[#0f766e]"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/" className="inline-flex items-center rounded-full border border-[#e7e5e4] bg-white px-6 py-3 font-medium text-[#1c1917] hover:bg-[#fafaf9]">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
