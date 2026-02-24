"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import EmergencyButton from "../ui/EmergencyButton";

const MARKETING_PATHS = ["/", "/about", "/how-it-works", "/contact"];

function isMarketingPath(pathname: string | null): boolean {
  if (!pathname) return true;
  return MARKETING_PATHS.includes(pathname) || pathname.startsWith("/blog") || pathname.startsWith("/news") || pathname === "/achievements" || pathname === "/subscribe";
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showAppUI = !isMarketingPath(pathname);

  return (
    <div className="min-h-screen bg-medical-gradient">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-24 md:pb-8">
        {children}
      </main>
      {showAppUI && <EmergencyButton />}
    </div>
  );
}
