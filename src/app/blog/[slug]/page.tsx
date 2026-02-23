import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import { BLOG_POSTS } from "@/lib/site-content";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#1c1917]">
      <article className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#57534e] hover:text-[#0d9488]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>
        <header className="mt-8">
          <span className="text-xs font-medium uppercase tracking-wider text-[#0d9488]">
            {post.category}
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
          <div className="mt-4 flex items-center gap-2 text-sm text-[#78716c]">
            <Calendar className="h-4 w-4" />
            {new Date(post.date).toLocaleDateString("en-NG", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </header>
        <div className="mt-8">
          <img
            src={post.image}
            alt=""
            className="rounded-xl object-cover w-full aspect-video"
          />
        </div>
        <div className="mt-8 prose prose-slate max-w-none">
          <p className="text-lg text-[#57534e]">{post.excerpt}</p>
          <p className="mt-4 text-[#57534e] leading-relaxed">
            Full article content would be loaded here from a CMS or markdown. This is a placeholder for the medical blog post.
          </p>
        </div>
      </article>
    </div>
  );
}
