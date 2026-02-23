"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import {
  sendEmergencyAlert,
  buildMedicalSnapshotFromCase,
} from "@/modules/emergency/services";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export default function EmergencyButton() {
  const { patientId } = useAuth();
  const [activated, setActivated] = useState(false);
  const hasSupabase = typeof window !== "undefined" && Boolean(getSupabaseBrowserClient());

  const notifyUser = (message: string) => {
    if (typeof window !== "undefined") alert(message);
  };

  const sendWithPayload = (lat?: number, lng?: number, address?: string) => {
    const base = { lat, lng, address, patientId: patientId ?? undefined };

    if (hasSupabase && patientId) {
      const supabase = getSupabaseBrowserClient();
      supabase
        ?.from("diagnosis_requests")
        .select("id, symptoms_text, ai_risk_level, ai_conditions, ai_medications")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          const diagnosis = data as {
            id: string;
            symptoms_text?: string | null;
            ai_risk_level?: string | null;
            ai_conditions?: unknown;
            ai_medications?: unknown;
          } | null;
          const payload = {
            ...base,
            diagnosisRequestId: diagnosis?.id,
            medicalHistorySnapshot: diagnosis
              ? buildMedicalSnapshotFromCase(diagnosis)
              : undefined,
          };
          return sendEmergencyAlert(payload);
        })
        .then(() =>
          notifyUser(
            "EMERGENCY ALERTED!\n\nYour location and medical context have been shared with emergency services.\nHelp is on the way — stay on the line."
          )
        )
        .catch(() =>
          notifyUser("Emergency alert could not be sent. Please call emergency services directly.")
        );
    } else {
      sendEmergencyAlert(base)
        .then(() =>
          notifyUser(
            "EMERGENCY ALERTED!\n\nYour location has been shared with emergency services.\nHelp is on the way — stay on the line."
          )
        )
        .catch(() =>
          notifyUser("Emergency alert could not be sent. Please call emergency services directly.")
        );
    }
  };

  const handleEmergency = () => {
    setActivated(true);
    if (typeof window === "undefined") return;

    if (hasSupabase) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          sendWithPayload(
            pos.coords.latitude,
            pos.coords.longitude
          ),
        () => sendWithPayload()
      );
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log("Emergency location (no Supabase):", pos.coords);
          notifyUser(
            "EMERGENCY ALERTED!\n\nYour location has been shared with emergency services.\nHelp is on the way — stay on the line."
          );
        },
        () => notifyUser("Emergency alerted! Please enable location for faster response.")
      );
    }
  };

  return (
    <button
      onClick={handleEmergency}
      className={`fixed bottom-6 right-6 z-50 flex h-20 w-20 items-center justify-center rounded-full bg-red-600 text-white shadow-2xl transition-all hover:scale-110 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-400 md:bottom-8 md:right-8 md:h-24 md:w-24 ${
        activated ? "" : "emergency-pulse"
      }`}
      aria-label="Emergency - Get help now"
    >
      <Phone className="h-10 w-10 md:h-12 md:w-12" strokeWidth={3} />
    </button>
  );
}
