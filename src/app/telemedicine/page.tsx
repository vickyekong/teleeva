"use client";

import { useState } from "react";
import { Video } from "lucide-react";

export default function TelemedicinePage() {
  const [inCall, setInCall] = useState(false);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Telemedicine</h1>
      <p className="mb-6 text-slate-600">Video calls with healthcare providers.</p>

      {!inCall ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <p className="text-slate-600">Schedule or start a video consultation.</p>
          <button
            onClick={() => setInCall(true)}
            className="mt-6 flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
          >
            <Video className="h-5 w-5" />
            Start Demo Call
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-2xl bg-slate-100">
            <Video className="h-20 w-20 text-slate-400" />
          </div>
          <p className="mt-4 font-medium">Call in progress (Demo)</p>
          <p className="text-sm text-slate-500">Integrate WebRTC for production</p>
          <button
            onClick={() => setInCall(false)}
            className="mt-6 rounded-xl bg-red-600 px-6 py-2 text-white hover:bg-red-700"
          >
            End Call
          </button>
        </div>
      )}
    </div>
  );
}
