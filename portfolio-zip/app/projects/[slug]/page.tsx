import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, GitBranch, ExternalLink, ShieldAlert, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Project, Profile } from "@/lib/supabase/types";
import type { Metadata } from "next";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("title, short_description")
    .eq("slug", slug)
    .single();

  if (!project) return { title: "Project Not Found" };

  return {
    title: `${project.title} | Project Detail`,
    description: project.short_description,
  };
}

const defaultProfile: Profile = {
  id: 1,
  name: "Developer",
  title: "Full-Stack Engineer",
  bio: "Building great products with modern technologies.",
  status: "available",
};

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const [profileRes, projectRes] = await Promise.all([
    supabase.from("profile").select("*").eq("id", 1).single(),
    supabase.from("projects").select("*").eq("slug", slug).single(),
  ]);

  const profile: Profile = profileRes.data || defaultProfile;
  const project: Project | null = projectRes.data;

  if (!project) {
    notFound();
  }

  // Format date helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  return (
    <main className="relative min-h-screen bg-background text-foreground font-display">
      <Nav siteTitle={`${profile.name?.toUpperCase().replace(/\s+/g, "_")}_V2`} />

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        {/* Navigation & Status */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Link href="/projects" className="text-muted-foreground hover:text-phosphor transition-colors flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest">
            <ArrowLeft className="size-3.5" /> Back to Repository
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Status:</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded ring-1 bg-phosphor/10 ring-phosphor/30 text-phosphor">
              {project.status}
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Left panel: Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border-l-2 border-phosphor/40 pl-6">
              <span className="font-mono text-[10px] text-phosphor tracking-[0.25em] uppercase">
                {project.category || "Deployment"}
              </span>
              <h1 className="text-3xl md:text-4xl font-medium tracking-tight mt-1 text-foreground">
                {project.title}
              </h1>
              {project.completion_date && (
                <p className="text-[11px] font-mono text-muted-foreground mt-2">
                  DEPLOYED_ON: {formatDate(project.completion_date).toUpperCase()}
                </p>
              )}
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed">
              {project.short_description}
            </p>

            {/* Links */}
            <div className="flex flex-wrap gap-4 pt-2">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 ring-1 ring-border hover:ring-phosphor/40 bg-card hover:text-phosphor rounded font-mono text-xs uppercase tracking-widest transition-all"
                >
                  <GitBranch className="size-4" /> Source Code
                </a>
              )}
              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-phosphor text-void hover:shadow-phosphor rounded font-mono text-xs uppercase tracking-widest transition-all"
                >
                  <ExternalLink className="size-4" /> Live Preview
                </a>
              )}
            </div>

            {/* Tech Stack */}
            {project.tech_stack && project.tech_stack.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-border/40">
                <h3 className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                  Tech Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.tech_stack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider bg-card text-foreground rounded ring-1 ring-border"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Metrics */}
            {project.metrics && Object.keys(project.metrics).length > 0 && (
              <div className="space-y-2 pt-4 border-t border-border/40">
                <h3 className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                  Key Metrics
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(project.metrics).map(([key, val]) => (
                    <div key={key} className="bg-card/50 ring-1 ring-border rounded p-3 text-center">
                      <div className="font-mono text-lg text-phosphor text-glow">{val}</div>
                      <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">{key.replace(/_/g, " ")}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right panel: Media & Descriptions */}
          <div className="lg:col-span-7 space-y-8">
            {/* Main Thumbnail */}
            <div className="relative w-full aspect-video bg-card rounded-lg overflow-hidden border border-border/80 shadow-lg">
              {project.thumbnail_url ? (
                <Image
                  src={project.thumbnail_url}
                  alt={project.title}
                  fill
                  priority
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 grid-bg opacity-30 flex items-center justify-center">
                  <span className="font-mono text-xs text-muted-foreground tracking-[0.2em]">
                    NO DEPLOYMENT PREVIEW AVAILABLE
                  </span>
                </div>
              )}
              <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
            </div>

            {/* Full description */}
            {project.full_description && (
              <div className="bg-card/40 border border-border/60 rounded-lg p-6 space-y-4">
                <h2 className="font-mono text-[10px] text-phosphor uppercase tracking-[0.25em] border-b border-border/40 pb-2">
                  Project Dossier / Details
                </h2>
                <div className="text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {project.full_description}
                </div>
              </div>
            )}

            {/* Achievements */}
            {project.achievements && project.achievements.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                  Key Achievements / Milestones
                </h2>
                <ul className="space-y-2">
                  {project.achievements.map((ach, i) => (
                    <li key={i} className="flex items-start gap-3 bg-card/25 ring-1 ring-border/40 p-3 rounded text-sm text-foreground/90">
                      <CheckCircle className="size-4 text-phosphor shrink-0 mt-0.5" />
                      <span>{ach}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Screenshots Gallery */}
            {project.screenshots && project.screenshots.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                  Screenshots / Gallery
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {project.screenshots.map((url, i) => (
                    <div key={i} className="relative aspect-video rounded overflow-hidden border border-border bg-card group">
                      <Image
                        src={url}
                        alt={`${project.title} screenshot ${i + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-550"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer profile={profile} />
    </main>
  );
}
