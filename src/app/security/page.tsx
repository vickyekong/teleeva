import { Shield, Lock, Eye, Users } from "lucide-react";

export default function SecurityPage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Security & Compliance</h1>
      <p className="mb-6 text-slate-600">HIPAA-style data privacy, encryption, and role-based access.</p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="mt-4 font-semibold text-slate-900">Data Privacy</h3>
          <p className="mt-2 text-sm text-slate-600">Medical records stored with encryption at rest and in transit. HIPAA-aligned policies.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
            <Lock className="h-6 w-6 text-emerald-600" />
          </div>
          <h3 className="mt-4 font-semibold text-slate-900">Secure Auth</h3>
          <p className="mt-2 text-sm text-slate-600">JWT-based authentication. MFA support for providers.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
            <Eye className="h-6 w-6 text-amber-600" />
          </div>
          <h3 className="mt-4 font-semibold text-slate-900">Encrypted Records</h3>
          <p className="mt-2 text-sm text-slate-600">Sensitive data encrypted. Audit logs for access.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
            <Users className="h-6 w-6 text-slate-600" />
          </div>
          <h3 className="mt-4 font-semibold text-slate-900">Role-Based Access</h3>
          <p className="mt-2 text-sm text-slate-600">Patients, nurses, pharmacists, doctors — each with appropriate access.</p>
        </div>
      </div>
    </div>
  );
}
