import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { BlogViewsCounter } from "@/components/sections/BlogViewsCounter";
import { Clock, Eye, Calendar, ArrowLeft, Tag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { Post, Profile } from "@/lib/supabase/types";
import type { Metadata } from "next";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("title, excerpt")
    .eq("slug", slug)
    .single();

  if (!post) return { title: "Post Not Found" };

  return {
    title: `${post.title} | Blog`,
    description: post.excerpt,
  };
}

const defaultProfile: Profile = {
  id: 1,
  name: "Developer",
  title: "Full-Stack Engineer",
  bio: "Building great products with modern technologies.",
  status: "available",
};

// Custom MDX Components for modern retro typography
const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-2xl font-semibold tracking-tight text-foreground mt-8 mb-4 border-l-2 border-phosphor/60 pl-4" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-xl font-medium tracking-tight text-foreground mt-6 mb-3 border-l border-border/80 pl-3" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-lg font-medium text-foreground mt-4 mb-2" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-muted-foreground text-sm leading-relaxed mb-4" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc pl-5 mb-4 text-muted-foreground text-sm space-y-1.5" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal pl-5 mb-4 text-muted-foreground text-sm space-y-1.5" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="pl-1" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a className="text-phosphor hover:underline transition-all" target="_blank" rel="noopener noreferrer" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-2 border-amber-flare bg-panel/30 px-4 py-3 rounded my-4 text-muted-foreground font-mono text-xs leading-relaxed" {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code className="bg-secondary/40 px-1.5 py-0.5 rounded text-xs font-mono text-amber-flare border border-border" {...props} />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="bg-card ring-1 ring-border p-4 rounded-lg overflow-x-auto font-mono text-xs text-foreground my-6 shadow-md" {...props} />
  ),
};

export default async function BlogPostDetailPage({ params }: PostPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const [profileRes, postRes] = await Promise.all([
    supabase.from("profile").select("*").eq("id", 1).single(),
    supabase.from("posts").select("*").eq("slug", slug).eq("published", true).single(),
  ]);

  const profile: Profile = profileRes.data || defaultProfile;
  const post: Post | null = postRes.data;

  if (!post) {
    notFound();
  }

  // Fetch related posts (latest posts in same category, excluding current post)
  const { data: relatedPosts } = await supabase
    .from("posts")
    .select("id, title, slug, cover_url, created_at")
    .eq("published", true)
    .eq("category", post.category || "")
    .neq("id", post.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <main className="relative min-h-screen bg-background text-foreground font-display">
      <Nav siteTitle={`${profile.name?.toUpperCase().replace(/\s+/g, "_")}_V2`} />
      <BlogViewsCounter slug={slug} />

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        {/* Navigation */}
        <Link href="/blog" className="text-muted-foreground hover:text-phosphor transition-colors flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest mb-8">
          <ArrowLeft className="size-3.5" /> Back to Transmissions
        </Link>

        {/* Cover Photo */}
        {post.cover_url && (
          <div className="relative w-full aspect-video bg-secondary/10 rounded-lg overflow-hidden border border-border/80 shadow-md mb-8">
            <Image
              src={post.cover_url}
              alt={post.title}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
          </div>
        )}

        {/* Article Meta */}
        <div className="space-y-4 mb-8 pb-8 border-b border-border/60">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-muted-foreground">
            <span className="text-phosphor uppercase tracking-wider">{post.category || "General"}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Calendar className="size-3.5" /> {formatDate(post.created_at)}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock className="size-3.5" /> {post.reading_time || 5} min read</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Eye className="size-3.5" /> {post.views || 0} views</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-snug">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-muted-foreground italic text-sm leading-relaxed border-l-2 border-border pl-4 py-0.5">
              {post.excerpt}
            </p>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider bg-secondary text-muted-foreground rounded"
                >
                  <Tag className="size-2.5" /> {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content Area */}
        <article className="prose prose-invert max-w-none">
          <MDXRemote source={post.content || ""} components={mdxComponents} />
        </article>

        {/* Related Posts */}
        {relatedPosts && relatedPosts.length > 0 && (
          <div className="mt-16 pt-8 border-t border-border/60">
            <h3 className="font-mono text-[10px] text-phosphor uppercase tracking-[0.25em] mb-6">
              // Related Transmissions
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.slug}`}
                  className="group block bg-card hover:ring-1 hover:ring-phosphor/35 ring-1 ring-border rounded-lg overflow-hidden transition-all duration-300 p-1 flex flex-col h-full"
                >
                  <div className="relative aspect-video rounded overflow-hidden bg-secondary/10">
                    {rel.cover_url ? (
                      <Image
                        src={rel.cover_url}
                        alt={rel.title}
                        fill
                        className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <div className="absolute inset-0 grid-bg opacity-30 flex items-center justify-center">
                        <span className="font-mono text-[8px] text-muted-foreground tracking-wider">NO COVER</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <h4 className="text-xs font-medium text-foreground group-hover:text-phosphor transition-colors line-clamp-2 mt-1 leading-snug">
                      {rel.title}
                    </h4>
                    <span className="font-mono text-[8px] text-muted-foreground mt-3 block">{new Date(rel.created_at).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer profile={profile} />
    </main>
  );
}
