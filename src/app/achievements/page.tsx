import Link from "next/link";
import { Award, MapPin } from "lucide-react";
import { BRAND_NAME } from "@/lib/constants";
import { MEDICAL_ACHIEVEMENTS } from "@/lib/site-content";

export default function AchievementsPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1c1917]">
      <div className="mx-auto max-w-4xl px-4 py-16 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Medical achievements</h1>
        <p className="mt-3 text-[#57534e]">
          We celebrate Nigerian and African healthcare leaders, researchers, and pioneers whose work has shaped medicine and public health at home and globally.
        </p>

        <div className="mt-12 space-y-10">
          {MEDICAL_ACHIEVEMENTS.map((person) => (
            <article
              key={person.id}
              className="overflow-hidden rounded-2xl border border-[#e7e5e4] bg-white transition hover:shadow-md"
            >
              <div className="flex flex-col sm:flex-row">
                <div className="h-56 w-full shrink-0 sm:h-auto sm:w-56">
                  <img
                    src={person.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-center p-6">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#0d9488]">
                    <Award className="h-4 w-4" />
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {person.country}
                    </span>
                  </div>
                  <h2 className="mt-2 text-xl font-semibold text-[#1c1917]">{person.name}</h2>
                  <p className="text-sm text-[#78716c]">{person.role}</p>
                  <p className="mt-3 text-[#57534e] leading-relaxed">{person.achievement}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-[#78716c]">
          <Link href="/" className="text-[#0d9488] hover:underline">Back to home</Link>
        </p>
      </div>
    </div>
  );
}
