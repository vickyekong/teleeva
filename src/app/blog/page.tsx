import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { BRAND_NAME } from "@/lib/constants";
import { BLOG_POSTS } from "@/lib/site-content";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1c1917]">
      <div className="mx-auto max-w-4xl px-4 py-16 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Medical blog</h1>
        <p className="mt-3 text-[#57534e]">
          Health information, care tips, and updates from {BRAND_NAME} — evidence-based and relevant for Nigeria, Africa, and beyond.
        </p>

        <div className="mt-12 space-y-8">
          {BLOG_POSTS.map((post) => (
            <article
              key={post.slug}
              className="overflow-hidden rounded-2xl border border-[#e7e5e4] bg-white transition hover:shadow-md"
            >
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="flex flex-col sm:flex-row">
                  <div className="h-48 w-full shrink-0 sm:h-40 sm:w-56">
                    <img
                      src={post.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center p-6">
                    <span className="text-xs font-medium uppercase tracking-wider text-[#0d9488]">
                      {post.category}
                    </span>
                    <h2 className="mt-2 text-xl font-semibold text-[#1c1917]">{post.title}</h2>
                    <p className="mt-2 text-sm text-[#57534e] line-clamp-2">{post.excerpt}</p>
                    <div className="mt-3 flex items-center gap-2 text-sm text-[#78716c]">
                      <Calendar className="h-4 w-4" />
                      {new Date(post.date).toLocaleDateString("en-NG", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#0d9488]">
                      Read more
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
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
