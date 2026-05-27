import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, Search, GitBranch, ExternalLink, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Project, Profile } from "@/lib/supabase/types";
import { ClientProjectsPage } from "./client-page";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profile")
    .select("name")
    .eq("id", 1)
    .single();

  return {
    title: `Projects | ${profile?.name || "Developer"}`,
    description: "Browse the repository of completed deployments, open-source projects, and ongoing experiments.",
  };
}

const defaultProfile: Profile = {
  id: 1,
  name: "Developer",
  title: "Full-Stack Engineer",
  bio: "Building great products with modern technologies.",
  status: "available",
};

export default async function ProjectsPage() {
  const supabase = await createClient();

  const [profileRes, projectsRes] = await Promise.all([
    supabase.from("profile").select("*").eq("id", 1).single(),
    supabase.from("projects").select("*").order("order_index").order("created_at", { ascending: false }),
  ]);

  const profile: Profile = profileRes.data || defaultProfile;
  const projects: Project[] = projectsRes.data || [];

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
            Repository Archive
          </h1>
          <p className="text-muted-foreground mt-2 font-mono text-xs tracking-wider">
            ALL_DEPLOYMENTS: {projects.length.toString().padStart(3, "0")}
          </p>
        </div>

        {/* Client side filters and list */}
        <ClientProjectsPage initialProjects={projects} />
      </div>

      <Footer profile={profile} />
    </main>
  );
}
