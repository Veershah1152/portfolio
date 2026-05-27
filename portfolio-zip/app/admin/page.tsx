import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Code2, Zap, BookOpen, MessageSquare, Clock, Link2, ArrowUpRight } from "lucide-react";

export default async function AdminPage() {
  const supabase = await createClient();

  const [projectsRes, skillsRes, postsRes, messagesRes, timelineRes] = await Promise.all([
    supabase.from("projects").select("id, featured", { count: "exact" }),
    supabase.from("skills").select("id", { count: "exact" }),
    supabase.from("posts").select("id, published", { count: "exact" }),
    supabase.from("contact_messages").select("id, read", { count: "exact" }),
    supabase.from("timeline").select("id", { count: "exact" }),
  ]);

  const unreadMessages = messagesRes.data?.filter((m) => !m.read).length || 0;
  const publishedPosts = postsRes.data?.filter((p) => p.published).length || 0;
  const featuredProjects = projectsRes.data?.filter((p) => p.featured).length || 0;

  const stats = [
    {
      label: "Projects",
      value: projectsRes.count || 0,
      sub: `${featuredProjects} featured`,
      icon: Code2,
      href: "/admin/projects",
      color: "text-phosphor",
    },
    {
      label: "Skills",
      value: skillsRes.count || 0,
      sub: "across all categories",
      icon: Zap,
      href: "/admin/skills",
      color: "text-phosphor",
    },
    {
      label: "Blog Posts",
      value: postsRes.count || 0,
      sub: `${publishedPosts} published`,
      icon: BookOpen,
      href: "/admin/blog",
      color: "text-phosphor",
    },
    {
      label: "Messages",
      value: messagesRes.count || 0,
      sub: unreadMessages > 0 ? `${unreadMessages} unread` : "all read",
      icon: MessageSquare,
      href: "/admin/messages",
      color: unreadMessages > 0 ? "text-amber-flare" : "text-phosphor",
      alert: unreadMessages > 0,
    },
    {
      label: "Timeline",
      value: timelineRes.count || 0,
      sub: "experience & education",
      icon: Clock,
      href: "/admin/timeline",
      color: "text-phosphor",
    },
  ];

  const quickActions = [
    { label: "New Project", href: "/admin/projects/new", icon: Code2 },
    { label: "New Blog Post", href: "/admin/blog/new", icon: BookOpen },
    { label: "LinkedIn Import", href: "/admin/linkedin", icon: Link2 },
    { label: "Edit Profile", href: "/admin/profile", icon: ArrowUpRight },
  ];

  return (
    <div className="space-y-8 pt-8 md:pt-0">
      {/* Header */}
      <div className="border-l-2 border-phosphor/40 pl-5">
        <p className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase mb-1">
          System Overview
        </p>
        <h1 className="text-2xl font-medium text-foreground">Control Panel</h1>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group relative bg-card ring-1 ring-border hover:ring-phosphor/30 rounded-lg p-4 transition-all"
          >
            {stat.alert && (
              <span className="absolute top-2 right-2 size-2 rounded-full bg-amber-flare animate-pulse" />
            )}
            <stat.icon className={`size-5 mb-3 ${stat.color}`} />
            <div className={`font-mono text-2xl font-medium mb-0.5 ${stat.color} text-glow`}>
              {stat.value}
            </div>
            <div className="font-mono text-[11px] text-foreground tracking-wider uppercase">
              {stat.label}
            </div>
            <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
              {stat.sub}
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase mb-4">
          Quick Actions
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group flex items-center gap-3 p-4 bg-card ring-1 ring-border hover:ring-phosphor/40 rounded-lg transition-all"
            >
              <action.icon className="size-4 text-muted-foreground group-hover:text-phosphor transition-colors" />
              <span className="font-mono text-[12px] text-foreground group-hover:text-phosphor transition-colors tracking-wider uppercase">
                {action.label}
              </span>
              <ArrowUpRight className="size-3.5 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent messages preview */}
      {unreadMessages > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
              Unread Messages
            </h2>
            <Link
              href="/admin/messages"
              className="font-mono text-[10px] text-phosphor hover:text-foreground transition-colors uppercase tracking-wider"
            >
              View All →
            </Link>
          </div>
          <div className="bg-card ring-1 ring-amber-flare/20 rounded-lg p-4">
            <p className="font-mono text-sm text-amber-flare">
              {unreadMessages} unread message{unreadMessages > 1 ? "s" : ""} waiting.
            </p>
          </div>
        </div>
      )}

      {/* System status */}
      <div className="bg-card/40 ring-1 ring-border/60 rounded-lg p-5">
        <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground tracking-wider uppercase">
          <span className="size-1.5 rounded-full bg-phosphor animate-pulse" />
          System Operational · Next.js 15 · Supabase · Deployed
        </div>
      </div>
    </div>
  );
}
