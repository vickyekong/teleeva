"use client";

export default function EmailSignup() {
  return (
    <form
      className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="email"
        placeholder="Email address"
        className="rounded-xl border border-[#e7e5e4] bg-white px-4 py-3 text-[#1c1917] placeholder:text-[#78716c] focus:border-[#0d9488] focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20"
        aria-label="Email for updates"
      />
      <button
        type="submit"
        className="rounded-xl bg-[#0d9488] px-6 py-3 font-semibold text-white hover:bg-[#0f766e]"
      >
        Subscribe
      </button>
    </form>
  );
}
