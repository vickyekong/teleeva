"use client";

import { useState } from "react";
import { Bell, Plus } from "lucide-react";

export default function RemindersPage() {
  const [reminders] = useState([
    { id: "1", title: "Take morning medication", time: "08:00", active: true },
    { id: "2", title: "Blood sugar check", time: "12:00", active: true },
  ]);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Health Reminders</h1>
      <p className="mb-6 text-slate-600">Never miss a medication or check-up.</p>

      <div className="space-y-4">
        {reminders.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">{r.title}</p>
                <p className="text-sm text-slate-500">{r.time}</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">Active</span>
          </div>
        ))}
      </div>

      <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-4 text-slate-600 hover:border-blue-300 hover:bg-blue-50">
        <Plus className="h-5 w-5" />
        Add Reminder
      </button>
    </div>
  );
}
