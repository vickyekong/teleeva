"use client";

import { useState } from "react";
import { MapPin, CheckCircle } from "lucide-react";

export default function NurseRequestPage() {
  const [requested, setRequested] = useState(false);
  const [address, setAddress] = useState("");

  const handleRequest = () => {
    setRequested(true);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Request Nurse Visit</h1>
      <p className="mb-6 text-slate-600">
        Nurses receive your location, medical history, and AI diagnosis summary. Real-time tracking available.
      </p>

      {!requested ? (
        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Location</label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Your address or allow GPS"
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-4 py-3 text-slate-600 hover:bg-slate-50"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (p) => setAddress(`${p.coords.latitude}, ${p.coords.longitude}`),
                      () => alert("Unable to get location")
                    );
                  }
                }}
              >
                <MapPin className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Brief reason for visit</label>
            <textarea
              placeholder="E.g. wound dressing, medication administration..."
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              rows={3}
            />
          </div>
          <button
            onClick={handleRequest}
            className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            Request Nurse
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-emerald-600" />
          <h2 className="mt-4 text-xl font-semibold text-slate-900">Nurse Requested</h2>
          <p className="mt-2 text-slate-600">
            Nearby nurses have been notified. You'll see live tracking once one accepts.
          </p>
          <div className="mt-6 rounded-xl bg-white p-4 text-left">
            <p className="text-sm font-medium text-slate-700">Status: Waiting for acceptance</p>
            <p className="mt-1 text-sm text-slate-500">Estimated wait: 5–15 min</p>
          </div>
        </div>
      )}
    </div>
  );
}
