import Link from "next/link";
import { Pill, Truck, ClipboardCheck } from "lucide-react";

export default function PharmacyPlatformPage() {
  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pharmacy & Pharmacist Platform</h1>
          <p className="mt-1 text-slate-600">
            Verify prescriptions, manage orders, and track medication delivery.
          </p>
        </div>
        <img
          src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&q=80"
          alt="Pharmacy"
          className="h-24 w-full rounded-xl object-cover sm:h-20 sm:w-48"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Link
          href="/pharmacist"
          className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 hover:border-blue-200 hover:shadow-md"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100">
            <ClipboardCheck className="h-7 w-7 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Pharmacist Dashboard</h3>
            <p className="mt-1 text-sm text-slate-600">Review and approve AI-generated prescriptions</p>
          </div>
        </Link>
        <Link
          href="/dispatch"
          className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 hover:border-emerald-200 hover:shadow-md"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100">
            <Truck className="h-7 w-7 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Dispatch & Delivery</h3>
            <p className="mt-1 text-sm text-slate-600">Track medication orders and delivery</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
