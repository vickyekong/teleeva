import Link from "next/link";
import {
  MessageCircle,
  Users,
  Shield,
  Building2,
  Check,
  Mail,
  MapPin,
  Phone,
  ArrowRight,
  Stethoscope,
  Pill,
  AlertCircle,
  Newspaper,
  Award,
  BookOpen,
} from "lucide-react";
import { BRAND_NAME, AI_NAME } from "@/lib/constants";
import { BRAND } from "@/lib/brand";
import { LATEST_UPDATES, MEDICAL_NEWS, MEDICAL_ACHIEVEMENTS } from "@/lib/site-content";
import FAQ from "@/components/landing/FAQ";
import EmailSignup from "@/components/landing/EmailSignup";

const PLANS = [
  { name: "Basic", price: 9, period: "month", features: ["Eva virtual assistant", "Prescription tracking", "Basic support"] },
  { name: "Care", price: 19, period: "month", popular: true, features: ["Everything in Basic", "Nurse visits (discounted)", "HMO integration", "Priority support"] },
  { name: "Family", price: 39, period: "month", features: ["Everything in Care", "Up to 5 family members", "Chronic care monitoring", "24/7 support"] },
];

const PARTNERS = [
  { name: "Healthcare Systems Alliance", role: "Hospital network partner" },
  { name: "PharmaCare Logistics", role: "Medication delivery partner" },
  { name: "NurseFirst Association", role: "Nursing workforce partner" },
];

const INTENT_ITEMS = [
  { label: "Speak to Eva", href: "/subscribe", icon: MessageCircle, desc: "AI symptom guidance" },
  { label: "Book a nurse", href: "/subscribe", icon: Stethoscope, desc: "At-home visits" },
  { label: "Prescriptions", href: "/subscribe", icon: Pill, desc: "Track & refill" },
  { label: "Emergency", href: "/subscribe", icon: AlertCircle, desc: "One-tap help" },
];

const TRUST_ITEMS = [
  { title: "Licensed providers", body: "Care prescribed by real medical professionals licensed in your state.", icon: Users },
  { title: "Secure & private", body: "HIPAA-style privacy and role-based access. Your data stays protected.", icon: Shield },
  { title: "One platform", body: "Eva, nurses, pharmacists, doctors, and emergency — all in one place.", icon: Building2 },
];

export default function LandingPage() {
  return (
    <div className="landing-page min-h-screen bg-[#fafaf9] text-[#1c1917]">
      {/* Top bar — Hims-style trust line */}
      <div className="border-b border-[#e7e5e4] bg-[#f8f6f3] py-2.5 text-center text-sm text-[#57534e]">
        <span>Plans from $9/mo</span>
        <span className="mx-3 text-[#d6d3d1]">·</span>
        <span>Licensed providers</span>
        <span className="mx-3 text-[#d6d3d1]">·</span>
        <span>100% online care</span>
      </div>

      {/* Hero — Headspace-style: calm, two-line headline, soft gradient */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f0fdfa] via-[#fafaf9] to-[#f8f6f3] pt-16 pb-20 sm:pt-20 sm:pb-28">
        <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
          <h1 className="text-4xl font-bold leading-[1.15] tracking-tight text-[#1c1917] sm:text-5xl md:text-6xl">
            Feel better.
            <br />
            <span className="text-[#0d9488]">All in one place.</span>
          </h1>
          <p className="mt-5 text-lg text-[#57534e] sm:text-xl">
            Healthcare platform with {AI_NAME}, prescriptions, nurse visits, and emergency support.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/subscribe"
              className="inline-flex items-center gap-2 rounded-full bg-[#0d9488] px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-[#0f766e]"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#0d9488] bg-transparent px-6 py-3.5 text-base font-semibold text-[#0d9488] transition hover:bg-[#f0fdfa]"
            >
              Access app
            </Link>
            <Link
              href="/#about"
              className="inline-flex items-center rounded-full border-2 border-[#e7e5e4] bg-white px-6 py-3.5 text-base font-semibold text-[#1c1917] transition hover:border-[#0d9488] hover:bg-[#f0fdfa]"
            >
              See how it works
            </Link>
          </div>
        </div>
      </section>

      {/* What do you need? — Headspace intent strip, Hims product categories */}
      <section className="border-y border-[#e7e5e4] bg-white py-10">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <h2 className="text-center text-xl font-semibold text-[#1c1917] sm:text-2xl">
            What do you need?
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {INTENT_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group flex flex-col items-center rounded-2xl border border-[#e7e5e4] bg-[#fafaf9] p-6 text-center transition hover:border-[#0d9488]/50 hover:bg-[#f0fdfa]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ccfbf1] text-[#0d9488] transition group-hover:bg-[#0d9488] group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="mt-3 font-semibold text-[#1c1917]">{item.label}</span>
                  <span className="mt-1 text-sm text-[#78716c]">{item.desc}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Brand — detailed */}
      <section id="brand" className="scroll-mt-24 border-b border-[#e7e5e4] bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-[#1c1917] sm:text-3xl">About {BRAND_NAME}</h2>
          <p className="mt-4 max-w-3xl text-[#57534e] leading-relaxed">{BRAND.mission}</p>
          <p className="mt-4 max-w-3xl text-[#57534e] leading-relaxed">{BRAND.story}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BRAND.values.map((v) => (
              <div key={v.title} className="rounded-xl border border-[#e7e5e4] bg-[#fafaf9] p-4">
                <h3 className="font-semibold text-[#1c1917]">{v.title}</h3>
                <p className="mt-2 text-sm text-[#57534e]">{v.body}</p>
              </div>
            ))}
          </div>
          <Link
            href="/about"
            className="mt-6 inline-flex items-center gap-2 font-semibold text-[#0d9488] hover:underline"
          >
            Full brand story
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Latest updates — medical, programs, health benefits */}
      <section id="updates" className="scroll-mt-24 border-b border-[#e7e5e4] bg-[#f8f6f3] py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <h2 className="text-2xl font-bold text-[#1c1917] sm:text-3xl">Latest updates</h2>
          <p className="mt-2 text-[#57534e]">
            Medical guidelines, program changes, and health benefit updates — so you stay informed.
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            <div className="rounded-xl border border-[#e7e5e4] bg-white p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ccfbf1] text-[#0d9488]">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-[#1c1917]">Medical updates</h3>
              <ul className="mt-3 space-y-2">
                {LATEST_UPDATES.medical.slice(0, 2).map((u) => (
                  <li key={u.title} className="text-sm text-[#57534e]">
                    <span className="font-medium text-[#1c1917]">{u.title}</span>
                    <span className="block text-[#78716c]">{u.summary}</span>
                  </li>
                ))}
              </ul>
              <Link href="/blog" className="mt-3 text-sm font-medium text-[#0d9488] hover:underline">More on blog</Link>
            </div>
            <div className="rounded-xl border border-[#e7e5e4] bg-white p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e0e7ff] text-[#3730a3]">
                <Stethoscope className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-[#1c1917]">Programs & interventions</h3>
              <ul className="mt-3 space-y-2">
                {LATEST_UPDATES.programs.slice(0, 2).map((u) => (
                  <li key={u.title} className="text-sm text-[#57534e]">
                    <span className="font-medium text-[#1c1917]">{u.title}</span>
                    <span className="block text-[#78716c]">{u.summary}</span>
                  </li>
                ))}
              </ul>
              <Link href="/blog" className="mt-3 text-sm font-medium text-[#0d9488] hover:underline">More on blog</Link>
            </div>
            <div className="rounded-xl border border-[#e7e5e4] bg-white p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#dcfce7] text-[#15803d]">
                <Check className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-[#1c1917]">Health benefits</h3>
              <ul className="mt-3 space-y-2">
                {LATEST_UPDATES.healthBenefits.slice(0, 2).map((u) => (
                  <li key={u.title} className="text-sm text-[#57534e]">
                    <span className="font-medium text-[#1c1917]">{u.title}</span>
                    <span className="block text-[#78716c]">{u.summary}</span>
                  </li>
                ))}
              </ul>
              <Link href="/#prices" className="mt-3 text-sm font-medium text-[#0d9488] hover:underline">View plans</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured medical news — Africa & Nigeria */}
      <section id="news" className="scroll-mt-24 border-b border-[#e7e5e4] bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#1c1917] sm:text-3xl">Medical news</h2>
              <p className="mt-2 text-[#57534e]">Africa & Nigeria — policy, programmes, and guidelines.</p>
            </div>
            <Link
              href="/news"
              className="inline-flex items-center gap-2 font-semibold text-[#0d9488] hover:underline"
            >
              All news
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {MEDICAL_NEWS.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="flex gap-4 rounded-xl border border-[#e7e5e4] bg-[#fafaf9] p-4 transition hover:border-[#0d9488]/30"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ccfbf1] text-[#0d9488]">
                  <Newspaper className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-[#1c1917]">{item.title}</h3>
                  <p className="mt-1 text-sm text-[#57534e] line-clamp-2">{item.excerpt}</p>
                  <p className="mt-2 text-xs text-[#78716c]">{item.region} · {item.source}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Medical achievements — Nigerians & Africans */}
      <section id="achievements" className="scroll-mt-24 border-b border-[#e7e5e4] bg-[#f0fdfa] py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#1c1917] sm:text-3xl">Medical achievements</h2>
              <p className="mt-2 text-[#57534e]">Nigerian and African leaders in healthcare and public health.</p>
            </div>
            <Link
              href="/achievements"
              className="inline-flex items-center gap-2 font-semibold text-[#0d9488] hover:underline"
            >
              See all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {MEDICAL_ACHIEVEMENTS.slice(0, 3).map((person) => (
              <div
                key={person.id}
                className="overflow-hidden rounded-xl border border-[#e7e5e4] bg-white transition hover:shadow-md"
              >
                <div className="h-36 w-full overflow-hidden">
                  <img src={person.image} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#0d9488]">
                    <Award className="h-4 w-4" />
                    {person.country}
                  </div>
                  <h3 className="mt-2 font-semibold text-[#1c1917]">{person.name}</h3>
                  <p className="text-sm text-[#78716c]">{person.role}</p>
                  <p className="mt-2 text-sm text-[#57534e] line-clamp-3">{person.achievement}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust blocks — Hims-style */}
      <section className="border-b border-[#e7e5e4] bg-[#f8f6f3] py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-[#1c1917] sm:text-3xl">
            Care you can trust
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {TRUST_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-[#e7e5e4] bg-white p-6 text-center"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#ccfbf1] text-[#0d9488]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-semibold text-[#1c1917]">{item.title}</h3>
                  <p className="mt-2 text-sm text-[#57534e] leading-relaxed">{item.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About — Tight copy, Headspace tone */}
      <section id="about" className="scroll-mt-24 border-b border-[#e7e5e4] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-[#1c1917] sm:text-4xl">
                Built for how you live.
              </h2>
              <p className="mt-6 max-w-xl text-lg text-[#57534e] leading-relaxed">
                {BRAND_NAME} is for people who want clear, quick health guidance and for providers who
                want to deliver care without friction. {AI_NAME} helps with symptoms. Pharmacists
                verify prescriptions. Nurses come when you need them. Emergency is one tap away.
              </p>
              <Link
                href="/subscribe"
                className="mt-6 inline-flex items-center gap-2 font-semibold text-[#0d9488] hover:underline"
              >
                Get personalized care
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80"
                alt="Healthcare team"
                className="rounded-2xl object-cover w-full aspect-[4/3] shadow-lg"
              />
            </div>
          </div>
          <div className="mt-16">
            <h3 className="text-lg font-semibold text-[#1c1917]">Partners</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {PARTNERS.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center gap-4 rounded-xl border border-[#e7e5e4] bg-[#fafaf9] p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ccfbf1] text-[#0d9488]">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-[#1c1917]">{p.name}</p>
                    <p className="text-sm text-[#78716c]">{p.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why MedConnect — Keep values, tighter */}
      <section className="border-b border-[#e7e5e4] bg-[#f8f6f3]">
        <div className="mx-auto max-w-6xl px-4 py-20 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-[#1c1917] sm:text-4xl">
            One platform. Real care.
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#e7e5e4] bg-white p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ccfbf1] text-[#0d9488]">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold text-[#1c1917]">{AI_NAME} — Your health assistant</h3>
              <p className="mt-2 text-sm text-[#57534e] leading-relaxed">
                Say &quot;Hi {AI_NAME}&quot; and describe your symptoms. Get guidance and support when you need it.
              </p>
            </div>
            <div className="rounded-2xl border border-[#e7e5e4] bg-white p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#dcfce7] text-[#15803d]">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold text-[#1c1917]">Providers in one place</h3>
              <p className="mt-2 text-sm text-[#57534e] leading-relaxed">
                Doctors, nurses, pharmacists, and dispatch work together for seamless care.
              </p>
            </div>
            <div className="rounded-2xl border border-[#e7e5e4] bg-white p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e0e7ff] text-[#3730a3]">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold text-[#1c1917]">Secure and compliant</h3>
              <p className="mt-2 text-sm text-[#57534e] leading-relaxed">
                HIPAA-style privacy and role-based access. Your data is protected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Prices — Hims-style clear pricing */}
      <section id="prices" className="scroll-mt-24 border-b border-[#e7e5e4] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[#1c1917] sm:text-4xl">
              Simple pricing
            </h2>
            <p className="mt-2 text-[#57534e]">Plans for every need. Cancel anytime.</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border-2 p-6 ${
                  (plan as { popular?: boolean }).popular
                    ? "border-[#0d9488] bg-[#f0fdfa]"
                    : "border-[#e7e5e4] bg-white"
                }`}
              >
                {(plan as { popular?: boolean }).popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#0d9488] px-3 py-1 text-xs font-semibold text-white">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-[#1c1917]">{plan.name}</h3>
                <p className="mt-3">
                  <span className="text-3xl font-bold text-[#1c1917]">${plan.price}</span>
                  <span className="text-[#78716c]">/{plan.period}</span>
                </p>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[#57534e]">
                      <Check className="h-4 w-4 shrink-0 text-[#0d9488]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/subscribe"
                  className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold ${
                    (plan as { popular?: boolean }).popular
                      ? "bg-[#0d9488] text-white hover:bg-[#0f766e]"
                      : "border-2 border-[#e7e5e4] text-[#1c1917] hover:border-[#0d9488] hover:bg-[#f0fdfa]"
                  }`}
                >
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="scroll-mt-24 border-b border-[#e7e5e4] bg-[#f8f6f3]">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
          <h2 className="text-2xl font-bold text-[#1c1917]">Get in touch</h2>
          <div className="mt-6 flex flex-wrap gap-x-10 gap-y-4 text-[#57534e]">
            <a href="mailto:hello@medconnect.example.com" className="flex items-center gap-2 hover:text-[#0d9488]">
              <Mail className="h-5 w-5 shrink-0" />
              hello@medconnect.example.com
            </a>
            <a href="tel:+1234567890" className="flex items-center gap-2 hover:text-[#0d9488]">
              <Phone className="h-5 w-5 shrink-0" />
              +1 (234) 567-890
            </a>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 shrink-0" />
              123 Healthcare Ave, Suite 100
            </div>
          </div>
        </div>
      </section>

      {/* FAQ — Headspace-style */}
      <section className="border-b border-[#e7e5e4] bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
          <h2 className="text-2xl font-bold text-[#1c1917] sm:text-3xl">
            Frequently asked questions
          </h2>
          <div className="mt-8">
            <FAQ />
          </div>
        </div>
      </section>

      {/* Stay in the loop — Headspace-style email strip */}
      <section className="border-b border-[#e7e5e4] bg-[#f0fdfa] py-12">
        <div className="mx-auto max-w-xl px-4 text-center lg:px-8">
          <h2 className="text-xl font-bold text-[#1c1917]">Stay in the loop</h2>
          <p className="mt-2 text-sm text-[#57534e]">
            Medical blog, news (Africa & Nigeria), and health benefit updates. No spam.
          </p>
          <EmailSignup />
        </div>
      </section>

      {/* CTA strip */}
      <section className="bg-[#0f172a] py-12 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
          <h2 className="text-2xl font-bold">Ready to use {BRAND_NAME}?</h2>
          <p className="mt-2 text-slate-400">Access the app to speak to Eva, subscribe, or join as a provider.</p>
          <Link
            href="/subscribe"
            className="mt-6 inline-block rounded-full bg-[#0d9488] px-8 py-3.5 font-semibold text-white hover:bg-[#0f766e]"
          >
            Get started — choose a plan
          </Link>
        </div>
      </section>

      <footer className="bg-[#fafaf9] py-8">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-[#78716c]">
            <Link href="/" className="hover:text-[#0d9488]">Home</Link>
            <Link href="/about" className="hover:text-[#0d9488]">About</Link>
            <Link href="/how-it-works" className="hover:text-[#0d9488]">How it works</Link>
            <Link href="/contact" className="hover:text-[#0d9488]">Contact</Link>
            <Link href="/blog" className="hover:text-[#0d9488]">Blog</Link>
            <Link href="/news" className="hover:text-[#0d9488]">News</Link>
            <a href="#prices" className="hover:text-[#0d9488]">Prices</a>
            <Link href="/subscribe" className="hover:text-[#0d9488]">Get started</Link>
            <Link href="/login" className="hover:text-[#0d9488]">Access app</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
