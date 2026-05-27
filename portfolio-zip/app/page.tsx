import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { About } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";
import { Projects } from "@/components/sections/Projects";
import { Terminal } from "@/components/sections/Terminal";
import { Contact } from "@/components/sections/Contact";
import type { Profile, Project, SkillGroup, TimelineEntry } from "@/lib/supabase/types";
import type { Metadata } from "next";

// Default fallback profile
const defaultProfile: Profile = {
  id: 1,
  name: "Developer",
  title: "Full-Stack Engineer",
  bio: "Building great products with modern technologies.",
  status: "available",
  stats: { ctfs: 0, commits: 0, projects: 0, streak: 0, vulnerabilities: 0 },
  roles: ["/usr/bin/developer", "/usr/bin/builder"],
  marquee_items: ["TYPESCRIPT", "REACT", "NEXT_JS", "SUPABASE"],
};

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profile")
    .select("name, title, bio")
    .eq("id", 1)
    .single();

  return {
    title: profile
      ? `${profile.name} — ${profile.title}`
      : "Portfolio — Developer",
    description: profile?.bio || "Developer portfolio",
  };
}

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch all data in parallel
  const [profileRes, projectsRes, skillsRes, timelineRes, postsRes] = await Promise.all([
    supabase.from("profile").select("*").eq("id", 1).single(),
    supabase.from("projects").select("*").order("order_index").order("created_at", { ascending: false }),
    supabase.from("skills").select("*").order("category").order("order_index"),
    supabase.from("timeline").select("*").order("order_index").order("start_date", { ascending: false }),
    supabase.from("posts").select("id, title, slug").eq("published", true).order("created_at", { ascending: false }).limit(5),
  ]);

  const profile: Profile = profileRes.data || defaultProfile;
  const projects: Project[] = projectsRes.data || [];
  const rawSkills = skillsRes.data || [];
  const timeline: TimelineEntry[] = timelineRes.data || [];
  const posts = postsRes.data || [];

  // Group skills by category
  const skillGroups: SkillGroup[] = rawSkills.reduce((acc: SkillGroup[], skill) => {
    const existing = acc.find((g) => g.category === skill.category);
    if (existing) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      existing.items.push(skill as any);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      acc.push({ category: skill.category, items: [skill as any] });
    }
    return acc;
  }, [] as SkillGroup[]);

  // Terminal dynamic data
  const terminalData = {
    name: profile.name,
    title: profile.title || "Developer",
    email: profile.email,
    skills: rawSkills.slice(0, 4).map(
      (s) => `${s.name.padEnd(12)} ${"█".repeat(Math.floor((s.percentage || 0) / 10))}${"░".repeat(10 - Math.floor((s.percentage || 0) / 10))} ${s.percentage}%`
    ),
    projects: projects.slice(0, 4).map((p) => `${p.title}  [${p.status}]`),
    posts: posts.map((p) => p.title),
  };

  return (
    <main className="relative min-h-screen bg-background text-foreground font-display">
      <Nav siteTitle={`${profile.name?.toUpperCase().replace(/\s+/g, "_")}_V2`} />
      <Hero profile={profile} />
      <Marquee items={profile.marquee_items} />
      <About profile={profile} timeline={timeline} />
      <Skills groups={skillGroups} />
      <Projects projects={projects} />
      <Terminal dynamicData={terminalData} />
      <Contact profile={profile} />
      <Footer profile={profile} />
    </main>
  );
}
