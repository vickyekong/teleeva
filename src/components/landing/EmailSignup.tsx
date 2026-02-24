"use client";

import { useState } from "react";

export default function EmailSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Thanks for subscribing!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Subscription failed. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <form
      className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center"
      onSubmit={handleSubmit}
    >
      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === "loading"}
        required
        className="rounded-xl border border-[#e7e5e4] bg-white px-4 py-3 text-[#1c1917] placeholder:text-[#78716c] focus:border-[#0d9488] focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 disabled:opacity-70"
        aria-label="Email for newsletter"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-xl bg-[#0d9488] px-6 py-3 font-semibold text-white hover:bg-[#0f766e] disabled:opacity-70"
      >
        {status === "loading" ? "Subscribing…" : "Subscribe"}
      </button>
      {message && (
        <p className={`w-full text-center text-sm sm:text-left ${status === "success" ? "text-[#15803d]" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </form>
  );
}
