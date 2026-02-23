"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/supabase/database.types";

type AuthState = {
  user: User | null;
  profile: Profile | null;
  patientId: string | null;
  loading: boolean;
  signIn: (email: string, password: string, role?: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string, role?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshPatientId: () => Promise<string | null>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = typeof window !== "undefined" ? getSupabaseBrowserClient() : null;

  const fetchProfile = useCallback(
    async (uid: string) => {
      if (!supabase) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
      return data as Profile | null;
    },
    [supabase]
  );

  const ensurePatientAndGetId = useCallback(
    async (uid: string): Promise<string | null> => {
      if (!supabase) return null;
      const { data: existing } = await supabase.from("patients").select("id").eq("user_id", uid).maybeSingle();
      if (existing?.id) {
        setPatientId(existing.id);
        return existing.id;
      }
      const { data: inserted, error } = await supabase.from("patients").insert({ user_id: uid }).select("id").single();
      if (error) return null;
      setPatientId(inserted?.id ?? null);
      return inserted?.id ?? null;
    },
    [supabase]
  );

  const refreshPatientId = useCallback(async () => {
    if (!user?.id || !profile) return null;
    if (profile.role !== "patient") return null;
    return ensurePatientAndGetId(user.id);
  }, [user?.id, profile, ensurePatientAndGetId]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const p = await fetchProfile(session.user.id);
        setProfile(p ?? null);
        if (p?.role === "patient") {
          await ensurePatientAndGetId(session.user.id);
        } else {
          setPatientId(null);
        }
      } else {
        setProfile(null);
        setPatientId(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then((p) => {
          setProfile(p ?? null);
          if (p?.role === "patient") {
            ensurePatientAndGetId(session.user.id).then(() => setLoading(false));
          } else {
            setLoading(false);
          }
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile, ensurePatientAndGetId]);

  const signIn = useCallback(
    async (email: string, password: string, role?: string) => {
      if (!supabase) return { error: new Error("Supabase not configured") };
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error };
      if (role) {
        await supabase.from("profiles").update({ role }).eq("id", (await supabase.auth.getUser()).data.user?.id);
      }
      return { error: null };
    },
    [supabase]
  );

  const signUp = useCallback(
    async (email: string, password: string, fullName?: string, role?: string) => {
      if (!supabase) return { error: new Error("Supabase not configured") };
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName ?? email.split("@")[0], role: role ?? "patient" },
        },
      });
      return { error: error ?? null };
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setPatientId(null);
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        patientId,
        loading,
        signIn,
        signUp,
        signOut,
        refreshPatientId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
