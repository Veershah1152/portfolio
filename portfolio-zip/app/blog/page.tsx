import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Clock, Eye, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Post, Profile } from "@/lib/supabase/types";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profile")
    .select("name")
    .eq("id", 1)
    .single();

  return {
    title: `Blog | ${profile?.name || "Developer"}`,
    description: "Read about my thoughts on engineering, security, and developer productivity.",
  };
}

const defaultProfile: Profile = {
  id: 1,
  name: "Developer",
  title: "Full-Stack Engineer",
  bio: "Building great products with modern technologies.",
  status: "available",
};

export default async function BlogIndexPage() {
  const supabase = await createClient();

  const [profileRes, postsRes] = await Promise.all([
    supabase.from("profile").select("*").eq("id", 1).single(),
    supabase.from("posts").select("*").eq("published", true).order("created_at", { ascending: false }),
  ]);

  const profile: Profile = profileRes.data || defaultProfile;
  const posts: Post[] = postsRes.data || [];

  const featuredPost = posts.find((p) => p.featured) || posts[0];
  const regularPosts = featuredPost ? posts.filter((p) => p.id !== featuredPost.id) : posts;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <main className="relative min-h-screen bg-background text-foreground font-display">
      <Nav siteTitle={`${profile.name?.toUpperCase().replace(/\s+/g, "_")}_V2`} />

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        {/* Header */}
        <div className="border-l-2 border-phosphor/40 pl-6 mb-12">
          <div className="flex items-center gap-2 mb-2">
            <Link href="/" className="text-muted-foreground hover:text-phosphor transition-colors flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest">
              <ArrowLeft className="size-3" /> Back to Dossier
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight">
            Transmissions
          </h1>
          <p className="text-muted-foreground mt-2 font-mono text-xs tracking-wider">
            JOURNAL_ENTRIES: {posts.length.toString().padStart(3, "0")}
          </p>
        </div>

        {/* Featured Post Banner */}
        {featuredPost && (
          <div className="mb-12">
            <div className="font-mono text-[10px] text-phosphor uppercase tracking-[0.2em] mb-3">
              // Featured Entry
            </div>
            <Link href={`/blog/${featuredPost.slug}`} className="group block bg-card hover:ring-1 hover:ring-phosphor/35 ring-1 ring-border rounded-lg overflow-hidden transition-all duration-300">
              <div className="grid md:grid-cols-12 gap-0">
                <div className="relative md:col-span-7 aspect-video md:aspect-auto min-h-[300px] bg-secondary/20">
                  {featuredPost.cover_url ? (
                    <Image
                      src={featuredPost.cover_url}
                      alt={featuredPost.title}
                      fill
                      className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-[1.01] transition-all duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 grid-bg opacity-30 flex items-center justify-center">
                      <span className="font-mono text-xs text-muted-foreground tracking-widest">NO ARTICLE COVER</span>
                    </div>
                  )}
                  <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
                </div>
                <div className="p-6 md:p-8 md:col-span-5 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                      <span className="text-phosphor/95 uppercase">{featuredPost.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Calendar className="size-3" /> {formatDate(featuredPost.created_at)}</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-medium text-foreground group-hover:text-phosphor transition-colors leading-snug">
                      {featuredPost.title}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                      {featuredPost.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] font-mono text-muted-foreground pt-4 border-t border-border/40">
                    <span className="flex items-center gap-1"><Clock className="size-3.5" /> {featuredPost.reading_time || 5} min read</span>
                    <span className="flex items-center gap-1"><Eye className="size-3.5" /> {featuredPost.views || 0} views</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Regular Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col bg-card hover:ring-1 hover:ring-phosphor/35 ring-1 ring-border rounded-lg overflow-hidden transition-all duration-300"
            >
              <div className="relative aspect-video bg-secondary/20">
                {post.cover_url ? (
                  <Image
                    src={post.cover_url}
                    alt={post.title}
                    fill
                    className="object-cover opacity-85 group-hover:opacity-100 group-hover:scale-[1.01] transition-all duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 grid-bg opacity-30 flex items-center justify-center">
                    <span className="font-mono text-[10px] text-muted-foreground tracking-widest">NO ARTICLE COVER</span>
                  </div>
                )}
                <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 text-[10px] font-mono text-muted-foreground">
                    <span className="text-phosphor uppercase">{post.category}</span>
                    <span>•</span>
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                  <h3 className="text-base font-medium text-foreground group-hover:text-phosphor transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground pt-3 border-t border-border/40">
                  <span className="flex items-center gap-1"><Clock className="size-3" /> {post.reading_time || 5} min</span>
                  <span className="flex items-center gap-1"><Eye className="size-3" /> {post.views || 0} views</span>
                </div>
              </div>
            </Link>
          ))}

          {posts.length === 0 && (
            <div className="md:col-span-2 lg:col-span-3 text-center py-20 border border-dashed border-border/60 rounded-lg">
              <p className="font-mono text-sm text-muted-foreground">No posts have been published yet.</p>
            </div>
          )}
        </div>
      </div>

      <Footer profile={profile} />
    </main>
  );
}
