import Link from "next/link";
import { Newspaper, MapPin, Calendar } from "lucide-react";
import { BRAND_NAME } from "@/lib/constants";
import { MEDICAL_NEWS } from "@/lib/site-content";

export default function NewsPage() {
  const nigeriaNews = MEDICAL_NEWS.filter((n) => n.region === "Nigeria");
  const africaNews = MEDICAL_NEWS.filter((n) => n.region === "Africa");

  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1c1917]">
      <div className="mx-auto max-w-4xl px-4 py-16 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Medical news</h1>
        <p className="mt-3 text-[#57534e]">
          Latest healthcare and policy updates from Nigeria, Africa, and global bodies — curated for the {BRAND_NAME} community.
        </p>

        <section className="mt-12">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-[#1c1917]">
            <MapPin className="h-5 w-5 text-[#0d9488]" />
            Nigeria
          </h2>
          <ul className="mt-4 space-y-4">
            {nigeriaNews.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-[#e7e5e4] bg-white p-5 transition hover:border-[#0d9488]/30"
              >
                <h3 className="font-semibold text-[#1c1917]">{item.title}</h3>
                <p className="mt-2 text-sm text-[#57534e]">{item.excerpt}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#78716c]">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(item.date).toLocaleDateString("en-NG", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span>{item.source}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-[#1c1917]">
            <Newspaper className="h-5 w-5 text-[#0d9488]" />
            Africa & global
          </h2>
          <ul className="mt-4 space-y-4">
            {africaNews.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-[#e7e5e4] bg-white p-5 transition hover:border-[#0d9488]/30"
              >
                <h3 className="font-semibold text-[#1c1917]">{item.title}</h3>
                <p className="mt-2 text-sm text-[#57534e]">{item.excerpt}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#78716c]">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(item.date).toLocaleDateString("en-NG", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span>{item.source}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-12 text-center text-sm text-[#78716c]">
          <Link href="/" className="text-[#0d9488] hover:underline">Back to home</Link>
        </p>
      </div>
    </div>
  );
}
