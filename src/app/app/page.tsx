import Link from "next/link";
import { MessageCircle, Users, Shield, Heart } from "lucide-react";
import { BRAND_NAME } from "@/lib/constants";

const HERO_IMAGE = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80";

export default function AppHomePage() {
  return (
    <div>
      {/* Hero — Brand landing */}
      <section className="relative overflow-hidden rounded-2xl bg-slate-100 py-16 text-center sm:py-24">
        <img
          src={HERO_IMAGE}
          alt="Healthcare and care"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="relative">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            {BRAND_NAME}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-700">
            Your health, connected. One platform for patients and providers — AI-powered care,
            real-time coordination, and peace of mind.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/patient-portal"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-blue-700"
            >
              <MessageCircle className="h-5 w-5" />
              Speak to Eva
            </Link>
            <Link
              href="/provider-portal"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50"
            >
              <Users className="h-5 w-5" />
              Become a provider
            </Link>
          </div>
        </div>
      </section>

      {/* About the brand */}
      <section className="mt-20">
        <h2 className="mb-6 text-2xl font-semibold text-slate-900">About {BRAND_NAME}</h2>
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <MessageCircle className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">Eva — Your health assistant</h3>
            <p className="mt-2 text-sm text-slate-600">
              Say &quot;Hi Eva&quot; and describe your symptoms. Get guidance, care options, and support when you need it.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">Providers in one place</h3>
            <p className="mt-2 text-sm text-slate-600">
              Doctors, nurses, pharmacists, and dispatch work together so you get seamless care.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">Secure and compliant</h3>
            <p className="mt-2 text-sm text-slate-600">
              Your data is protected with HIPAA-style privacy and role-based access.
            </p>
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="relative mt-20 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 p-8 text-center text-white sm:p-12">
        <img
          src="https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80"
          alt=""
          className="absolute right-0 top-0 h-full w-1/3 max-w-sm object-cover opacity-20"
          aria-hidden
        />
        <div className="relative">
        <h2 className="text-2xl font-bold sm:text-3xl">Ready to get started?</h2>
        <p className="mt-2 text-blue-100">Patients — speak to Eva. Providers — join the network.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            href="/patient-portal"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-blue-600 hover:bg-blue-50"
          >
            <MessageCircle className="h-5 w-5" />
            Speak to Eva
          </Link>
          <Link
            href="/provider-portal"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-white/80 bg-transparent px-6 py-3 font-semibold text-white hover:bg-white/10"
          >
            <Users className="h-5 w-5" />
            Become a provider
          </Link>
        </div>
        </div>
      </section>

      <footer className="mt-20 border-t border-slate-200 pt-8 pb-4">
        <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-600">
          <Link href="/security" className="hover:text-blue-600">Security & Compliance</Link>
          <Link href="/telemedicine" className="hover:text-blue-600">Telemedicine</Link>
        </div>
      </footer>
    </div>
  );
}
