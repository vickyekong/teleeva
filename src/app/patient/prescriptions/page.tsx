"use client";

import { Truck, Package } from "lucide-react";

export default function PrescriptionsPage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">My Prescriptions</h1>
      <p className="mb-6 text-slate-600">Track prescriptions and medication deliveries.</p>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <Package className="mx-auto h-12 w-12 text-slate-300" />
        <p className="mt-4 text-slate-600">No prescriptions yet.</p>
        <p className="text-sm text-slate-500">Prescriptions from AI diagnosis will appear here after pharmacist approval.</p>
      </div>
    </div>
  );
}
