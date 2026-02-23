"use client";

import Link from "next/link";
import { Stethoscope, Pill, Building2, FlaskConical, MapPin, Star } from "lucide-react";

const roles = [
  { id: "nurse", label: "Nurses", icon: MapPin, count: 24 },
  { id: "pharmacist", label: "Pharmacists", icon: Pill, count: 12 },
  { id: "doctor", label: "Doctors", icon: Stethoscope, count: 18 },
  { id: "hospital", label: "Hospitals", icon: Building2, count: 8 },
  { id: "lab", label: "Labs", icon: FlaskConical, count: 5 },
];

const mockProviders = [
  { name: "Sarah Johnson", role: "Nurse", rating: 4.9, reviews: 120, image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&q=80" },
  { name: "MedPlus Pharmacy", role: "Pharmacist", rating: 4.8, reviews: 85, image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&h=200&fit=crop&q=80" },
  { name: "Dr. Michael Chen", role: "Doctor", rating: 5.0, reviews: 64, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&q=80" },
];

export default function MarketplacePage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Healthcare Marketplace</h1>
      <p className="mb-6 text-slate-600">
        Find nurses, pharmacists, doctors, hospitals, and labs. Each provider has a profile, ratings, and earnings dashboard.
      </p>

      <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
        {roles.map((r) => (
          <Link
            key={r.id}
            href={`/marketplace/${r.id}`}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 whitespace-nowrap hover:border-blue-200"
          >
            <r.icon className="h-5 w-5 text-blue-600" />
            <span className="font-medium">{r.label}</span>
            <span className="text-sm text-slate-500">({r.count})</span>
          </Link>
        ))}
      </div>

      <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 p-6 text-white">
        <h2 className="text-lg font-semibold">Register as a Provider</h2>
        <p className="mt-1 text-blue-100">Earn from job requests. Set your rates. Build your profile.</p>
        <Link
          href="/marketplace/register"
          className="mt-4 inline-block rounded-xl bg-white px-6 py-2 font-semibold text-blue-600 hover:bg-blue-50"
        >
          Register
        </Link>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-slate-900">Featured Providers</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockProviders.map((p) => (
          <Link
            key={p.name}
            href={`/marketplace/provider/${p.name.toLowerCase().replace(/\s/g, "-")}`}
            className="rounded-2xl border border-slate-200 bg-white p-6 hover:border-blue-200 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <img
                src={p.image}
                alt=""
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-slate-900">{p.name}</p>
                <p className="text-sm text-slate-600">{p.role}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>{p.rating}</span>
              <span className="text-slate-500">({p.reviews} reviews)</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
