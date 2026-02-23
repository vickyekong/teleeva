"use client";

import { useState } from "react";
import { Building2, CheckCircle } from "lucide-react";

export default function HmoPage() {
  const [linked, setLinked] = useState(false);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">HMO Integration</h1>
          <p className="mt-1 text-slate-600">
            Link your insurance plan, view coverage, check approved hospitals, and pay with your HMO.
          </p>
        </div>
        <img
          src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&q=80"
          alt="Insurance and coverage"
          className="h-24 w-full rounded-xl object-cover sm:h-20 sm:w-48"
        />
      </div>

      {!linked ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Link Your HMO Plan</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">HMO Provider</label>
                <select className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3">
                  <option>Select provider...</option>
                  <option>Blue Cross</option>
                  <option>Aetna</option>
                  <option>Cigna</option>
                  <option>UnitedHealthcare</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Member ID</label>
                <input type="text" placeholder="e.g. MBR-123456" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Group Number</label>
                <input type="text" placeholder="Optional" className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3" />
              </div>
              <button
                onClick={() => setLinked(true)}
                className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Link Plan
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Blue Cross</h3>
                <p className="text-sm text-slate-600">Member ID: MBR-****56</p>
              </div>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle className="h-4 w-4" />
              Plan linked successfully
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="font-semibold text-slate-900">Coverage</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>• Doctor visits: Covered</li>
              <li>• Prescriptions: $10 co-pay</li>
              <li>• Nurse visits: $25 co-pay</li>
              <li>• Emergency: Covered</li>
            </ul>
          </div>
          <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="font-semibold text-slate-900">Approved Hospitals</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {["City General", "Metro Health", "St. Mary's"].map((h) => (
                <span key={h} className="rounded-lg bg-slate-100 px-3 py-1 text-sm">
                  {h}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
