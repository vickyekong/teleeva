import Navbar from "./Navbar";
import EmergencyButton from "../ui/EmergencyButton";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-medical-gradient">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 pb-24 md:pb-8">
        {children}
      </main>
      <EmergencyButton />
    </div>
  );
}
