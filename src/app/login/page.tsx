"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Stethoscope } from "lucide-react";
import { BRAND_NAME } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const [role, setRole] = useState("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!email.trim() || !password) {
      setMessage({ type: "error", text: "Email and password are required." });
      return;
    }
    setLoading(true);
    try {
      const { error } = isSignUp
        ? await signUp(email.trim(), password, fullName.trim() || undefined, role)
        : await signIn(email.trim(), password, role);
      if (error) {
        setMessage({ type: "error", text: error.message });
        setLoading(false);
        return;
      }
      setMessage({ type: "success", text: isSignUp ? "Account created. Check your email to confirm." : "Signed in." });
      router.push("/app");
      router.refresh();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Something went wrong." });
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <img
          src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80"
          alt="MedConnect care"
          className="h-36 w-full object-cover"
        />
        <div className="p-8">
          <div className="flex justify-center">
            <Link href="/app" className="flex items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Stethoscope className="h-7 w-7" />
              </div>
              <span className="text-xl font-semibold">{BRAND_NAME}</span>
            </Link>
          </div>

          <h1 className="mt-8 text-center text-2xl font-bold text-slate-900">
            {isSignUp ? "Create account" : "Sign In"}
          </h1>
          <p className="mt-2 text-center text-slate-600">
            Secure authentication with Supabase
          </p>

          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700">Sign in as</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
            >
              <option value="patient">Patient</option>
              <option value="nurse">Nurse</option>
              <option value="pharmacist">Pharmacist</option>
              <option value="doctor">Doctor</option>
              <option value="dispatcher">Dispatcher</option>
              <option value="admin">Admin</option>
              <option value="hospital">Hospital</option>
            </select>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-slate-700">Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                  placeholder="Your name"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            {message && (
              <p className={`text-sm ${message.type === "error" ? "text-red-600" : "text-green-600"}`}>
                {message.text}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Please wait…" : isSignUp ? "Create account" : "Sign In"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-600">
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setMessage(null); }}
              className="text-blue-600 hover:underline"
            >
              {isSignUp ? "Already have an account? Sign in" : "No account? Sign up"}
            </button>
          </p>

          <p className="mt-4 text-center text-sm text-slate-600">
            By signing in, you agree to our privacy policy and data handling practices.
          </p>
        </div>
      </div>
    </div>
  );
}
