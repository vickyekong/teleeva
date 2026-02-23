"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Stethoscope, X } from "lucide-react";
import { useState } from "react";
import { BRAND_NAME } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";

const sitePaths = ["/", "/about", "/blog", "/news", "/achievements"];
const siteNavItems = [
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/news", label: "News" },
  { href: "/achievements", label: "Achievements" },
  { href: "/#prices", label: "Prices" },
  { href: "/#contact", label: "Contact" },
];

const appNavItems = [
  { href: "/app", label: "Home" },
  { href: "/patient-portal", label: "Speak to Eva" },
  { href: "/provider-portal", label: "Become a provider" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const isSite = sitePaths.includes(pathname) || pathname.startsWith("/blog/");
  const navItems = isSite ? siteNavItems : appNavItems;

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    router.push("/app");
    router.refresh();
  };

  const headerClass =
    "sticky top-0 z-40 border-b border-[#e7e5e4] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80";

  const logoIconClass = "rounded-lg bg-[#0d9488] text-white";
  const logoTextClass = "text-xl font-semibold text-[#1c1917]";

  const navLinkClass = (item: { href: string }) => {
    const active = pathname === item.href || (item.href === "/app" && pathname.startsWith("/app")) || (item.href.startsWith("/#") && pathname === "/");
    return `text-sm font-medium transition-colors whitespace-nowrap ${active ? "text-[#0d9488]" : "text-[#57534e] hover:text-[#0d9488]"}`;
  };

  const ctaClass = "rounded-full bg-[#0d9488] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f766e]";

  return (
    <header className={headerClass}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href={isSite ? "/" : "/app"} className="flex items-center gap-2">
          <div className={`flex h-10 w-10 items-center justify-center ${logoIconClass}`}>
            <Stethoscope className="h-6 w-6" />
          </div>
          <span className={logoTextClass}>{BRAND_NAME}</span>
        </Link>

        <div className="hidden items-center gap-4 md:flex lg:gap-6">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={navLinkClass(item)}>
              {item.label}
            </Link>
          ))}
          {isSite && (
            <Link href="/subscribe" className={ctaClass}>
              Get started
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {!isSite && (
            user ? (
              <button type="button" onClick={handleSignOut} className={`hidden ${ctaClass} md:block`}>
                Sign Out
              </button>
            ) : (
              <Link href="/login" className={`hidden ${ctaClass} md:block`}>
                Sign In
              </Link>
            )
          )}
          <button
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2 text-[#57534e] hover:bg-[#f5f5f4] md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-[#e7e5e4] bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-4 py-2 text-sm ${
                  pathname === item.href ? "bg-[#f0fdfa] text-[#0d9488]" : "text-[#57534e]"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {isSite ? (
              <Link
                href="/subscribe"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full bg-[#0d9488] px-4 py-2 text-center text-sm font-semibold text-white"
              >
                Get started
              </Link>
            ) : user ? (
              <button
                type="button"
                onClick={() => { handleSignOut(); }}
                className="mt-2 w-full rounded-full bg-[#0d9488] px-4 py-2 text-center text-sm font-semibold text-white"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full bg-[#0d9488] px-4 py-2 text-center text-sm font-semibold text-white"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
