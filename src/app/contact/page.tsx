"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, ArrowRight, Send, Loader2 } from "lucide-react";
import { BRAND } from "@/lib/brand";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || undefined, email: email.trim(), message: message.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error || "Something went wrong.");
        return;
      }
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1c1917]">
      <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Contact us
        </h1>
        <p className="mt-4 text-lg text-[#57534e]">
          Have a question or feedback? Send us a message and we&apos;ll get back to you.
        </p>

        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold text-[#1c1917]">Send a message</h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="contact-name" className="block text-sm font-medium text-[#57534e]">
                  Name (optional)
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#e7e5e4] bg-white px-4 py-3 text-[#1c1917] placeholder:text-[#78716c] focus:border-[#0d9488] focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-[#57534e]">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#e7e5e4] bg-white px-4 py-3 text-[#1c1917] placeholder:text-[#78716c] focus:border-[#0d9488] focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-[#57534e]">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="contact-message"
                  required
                  minLength={10}
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#e7e5e4] bg-white px-4 py-3 text-[#1c1917] placeholder:text-[#78716c] focus:border-[#0d9488] focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20"
                  placeholder="Your message (at least 10 characters)"
                />
              </div>
              {status === "success" && (
                <p className="text-sm font-medium text-[#15803d]">
                  Thank you. We&apos;ll be in touch soon.
                </p>
              )}
              {status === "error" && (
                <p className="text-sm font-medium text-red-600">{errorMessage}</p>
              )}
              <button
                type="submit"
                disabled={status === "sending"}
                className="inline-flex items-center gap-2 rounded-full bg-[#0d9488] px-6 py-3 font-semibold text-white hover:bg-[#0f766e] disabled:opacity-70"
              >
                {status === "sending" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send message
                  </>
                )}
              </button>
            </form>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#1c1917]">Support & details</h2>
            <div className="mt-6 space-y-4">
              <a
                href={`mailto:${BRAND.contact.email}`}
                className="flex items-center gap-3 rounded-xl border border-[#e7e5e4] bg-white p-4 transition hover:border-[#0d9488]/50 hover:bg-[#f0fdfa]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ccfbf1] text-[#0d9488]">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-[#1c1917]">Email</p>
                  <p className="text-sm text-[#57534e]">{BRAND.contact.email}</p>
                </div>
              </a>
              <a
                href={`tel:${BRAND.contact.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-3 rounded-xl border border-[#e7e5e4] bg-white p-4 transition hover:border-[#0d9488]/50 hover:bg-[#f0fdfa]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ccfbf1] text-[#0d9488]">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-[#1c1917]">Phone</p>
                  <p className="text-sm text-[#57534e]">{BRAND.contact.phone}</p>
                </div>
              </a>
              <div className="flex items-center gap-3 rounded-xl border border-[#e7e5e4] bg-white p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ccfbf1] text-[#0d9488]">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-[#1c1917]">Address</p>
                  <p className="text-sm text-[#57534e]">{BRAND.contact.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap gap-4">
          <Link
            href="/subscribe"
            className="inline-flex items-center gap-2 rounded-full bg-[#0d9488] px-6 py-3 font-semibold text-white hover:bg-[#0f766e]"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/" className="inline-flex items-center rounded-full border border-[#e7e5e4] bg-white px-6 py-3 font-medium text-[#1c1917] hover:bg-[#fafaf9]">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
