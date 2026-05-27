"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2, GitBranch, ExternalLink, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/supabase/types";

interface ClientProjectsListPageProps {
  initialProjects: Project[];
}

const statusColors: Record<string, string> = {
  STABLE: "text-phosphor bg-phosphor/10 ring-phosphor/30",
  BETA: "text-amber-flare bg-amber-flare/10 ring-amber-flare/30",
  ALPHA: "text-orange-400 bg-orange-400/10 ring-orange-400/30",
  WIP: "text-blue-400 bg-blue-400/10 ring-blue-400/30",
  ARCHIVED: "text-muted-foreground bg-secondary ring-border",
};

export function ClientProjectsListPage({ initialProjects }: ClientProjectsListPageProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const supabase = createClient();

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove the project "${title}"?`)) return;

    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;

      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Project removed successfully");
    } catch (err) {
      toast.error("Failed to delete project");
      console.error(err);
    }
  };

  const handleToggleFeatured = async (project: Project) => {
    const nextFeatured = !project.featured;
    try {
      const { error } = await supabase
        .from("projects")
        .update({ featured: nextFeatured })
        .eq("id", project.id);

      if (error) throw error;

      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, featured: nextFeatured } : p))
      );
      toast.success(nextFeatured ? "Marked as featured" : "Removed from featured");
    } catch (err) {
      toast.error("Failed to update status");
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex justify-between items-center">
        <div className="font-mono text-xs text-muted-foreground">
          PROJECTS_INDEX: {projects.length.toString().padStart(2, "0")}
        </div>
        <Link
          href="/admin/projects/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-phosphor text-void font-mono text-xs uppercase tracking-widest rounded hover:shadow-phosphor transition-all"
          id="admin-new-project-btn"
        >
          <Plus className="size-3.5" /> New Project
        </Link>
      </div>

      {/* Grid List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p) => (
          <div
            key={p.id}
            className="group relative bg-card/60 ring-1 ring-border rounded-lg overflow-hidden flex flex-col justify-between"
          >
            {/* Header / Thumbnail */}
            <div className="relative aspect-video w-full bg-secondary/10">
              {p.thumbnail_url ? (
                <Image
                  src={p.thumbnail_url}
                  alt={p.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 30vw"
                  className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
              ) : (
                <div className="absolute inset-0 grid-bg opacity-30 flex items-center justify-center">
                  <span className="font-mono text-[9px] text-muted-foreground tracking-widest">
                    NO COVER PREVIEW
                  </span>
                </div>
              )}
              <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />

              {/* Status / Category Badges */}
              <div className="absolute top-2 left-2 flex gap-1">
                <span className={cn(
                  "text-[9px] font-mono px-1.5 py-0.5 rounded ring-1 bg-background/80 backdrop-blur-sm",
                  statusColors[p.status] || statusColors.STABLE
                )}>
                  {p.status}
                </span>
                {p.category && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded ring-1 bg-background/80 ring-border/80 text-muted-foreground backdrop-blur-sm">
                    {p.category.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Star/Featured trigger */}
              <button
                onClick={() => handleToggleFeatured(p)}
                className="absolute top-2 right-2 size-6 grid place-items-center rounded bg-background/85 border border-border/80 text-muted-foreground hover:text-phosphor transition-colors shadow-sm"
                title={p.featured ? "Remove from featured" : "Mark as featured"}
              >
                <Star className={cn("size-3.5", p.featured ? "fill-phosphor text-phosphor" : "text-muted-foreground")} />
              </button>
            </div>

            {/* Info Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <h3 className="text-base font-medium text-foreground">{p.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {p.short_description}
                </p>
              </div>

              {p.tech_stack && p.tech_stack.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {p.tech_stack.slice(0, 4).map((tech) => (
                    <span key={tech} className="px-1.5 py-0.2 text-[8px] font-mono uppercase bg-secondary/80 text-muted-foreground rounded">
                      {tech}
                    </span>
                  ))}
                  {p.tech_stack.length > 4 && (
                    <span className="text-[8px] font-mono text-muted-foreground px-1">+{p.tech_stack.length - 4}</span>
                  )}
                </div>
              )}
            </div>

            {/* Footer / Actions */}
            <div className="px-5 py-4 border-t border-border/40 bg-secondary/10 flex gap-2 items-center justify-between">
              <div className="flex gap-2">
                {p.github_url && <span title="Has source code"><GitBranch className="size-3.5 text-muted-foreground" /></span>}
                {p.live_url && <span title="Has live demo"><ExternalLink className="size-3.5 text-muted-foreground" /></span>}
              </div>
              <div className="flex gap-1.5">
                <Link
                  href={`/admin/projects/${p.id}`}
                  className="size-8 grid place-items-center rounded hover:bg-secondary text-muted-foreground hover:text-phosphor transition-colors border border-transparent hover:border-border/60"
                  title="Edit details"
                >
                  <Edit className="size-3.5" />
                </Link>
                <button
                  onClick={() => handleDelete(p.id, p.title)}
                  className="size-8 grid place-items-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors border border-transparent hover:border-destructive/20"
                  title="Remove project"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 text-center py-16 border border-dashed border-border/60 rounded-lg">
            <p className="font-mono text-sm text-muted-foreground">No projects found. Add one or import from LinkedIn.</p>
          </div>
        )}
      </div>
    </div>
  );
}
