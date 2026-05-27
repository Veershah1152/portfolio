"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { slugify } from "@/lib/utils";
import type { Project, ProjectStatus } from "@/lib/supabase/types";

interface ProjectFormProps {
  initialData?: Project;
}

export function ProjectForm({ initialData }: ProjectFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [shortDesc, setShortDesc] = useState(initialData?.short_description || "");
  const [fullDesc, setFullDesc] = useState(initialData?.full_description || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [status, setStatus] = useState<ProjectStatus>(initialData?.status || "WIP");
  const [techStack, setTechStack] = useState(initialData?.tech_stack?.join(", ") || "");
  const [tags, setTags] = useState(initialData?.tags?.join(", ") || "");
  const [githubUrl, setGithubUrl] = useState(initialData?.github_url || "");
  const [liveUrl, setLiveUrl] = useState(initialData?.live_url || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnail_url || "");
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [orderIndex, setOrderIndex] = useState(initialData?.order_index || 0);
  const [completionDate, setCompletionDate] = useState(initialData?.completion_date || "");
  const [achievements, setAchievements] = useState(initialData?.achievements?.join("\n") || "");
  
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!isEdit) {
      setSlug(slugify(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug) {
      toast.error("Title and Slug are required.");
      return;
    }

    setSaving(true);

    const payload = {
      title: title.trim(),
      slug: slug.trim().toLowerCase(),
      short_description: shortDesc.trim() || null,
      full_description: fullDesc.trim() || null,
      category: category.trim() || null,
      status,
      tech_stack: techStack.split(",").map((s) => s.trim()).filter(Boolean),
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      github_url: githubUrl.trim() || null,
      live_url: liveUrl.trim() || null,
      thumbnail_url: thumbnailUrl.trim() || null,
      featured,
      order_index: orderIndex,
      completion_date: completionDate || null,
      achievements: achievements.split("\n").map((a) => a.trim()).filter(Boolean),
      updated_at: new Date().toISOString(),
    };

    try {
      if (isEdit) {
        const { error } = await supabase
          .from("projects")
          .update(payload)
          .eq("id", initialData.id);

        if (error) throw error;
        toast.success("Project updated successfully");
      } else {
        const { error } = await supabase
          .from("projects")
          .insert(payload);

        if (error) throw error;
        toast.success("Project created successfully");
      }
      
      router.push("/admin/projects");
      router.refresh();
    } catch (err) {
      toast.error("Operation failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Navigation */}
      <Link href="/admin/projects" className="inline-flex items-center gap-1 font-mono text-[10px] uppercase text-muted-foreground hover:text-phosphor transition-colors">
        <ArrowLeft className="size-3.5" /> Back to List
      </Link>

      <div className="bg-card ring-1 ring-border rounded-lg p-6 space-y-4">
        <h2 className="font-mono text-[11px] text-phosphor uppercase tracking-[0.2em] border-b border-border/60 pb-2">
          {isEdit ? "// Edit Project Details" : "// Create New Project"}
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Title</label>
            <input
              value={title}
              onChange={handleTitleChange}
              required
              placeholder="e.g. My Portfolio Website"
              className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground"
              id="project-form-title"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Slug (Unique URL)</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              placeholder="e.g. portfolio-website"
              className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground"
              id="project-form-slug"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Web App / Cybersecurity"
              className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground"
              id="project-form-category"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Project Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground"
              id="project-form-status"
            >
              <option value="STABLE">STABLE</option>
              <option value="BETA">BETA</option>
              <option value="ALPHA">ALPHA</option>
              <option value="WIP">WIP</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Short Description</label>
          <input
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
            placeholder="A brief overview of the project for cards (1-2 sentences)"
            className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground"
            id="project-form-short-desc"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Full Description / Documentation</label>
          <textarea
            value={fullDesc}
            onChange={(e) => setFullDesc(e.target.value)}
            rows={6}
            placeholder="Detailed description of the project architecture, features, etc..."
            className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground resize-none"
            id="project-form-full-desc"
          />
        </div>
      </div>

      {/* Tech & Links */}
      <div className="bg-card ring-1 ring-border rounded-lg p-6 space-y-4">
        <h2 className="font-mono text-[11px] text-phosphor uppercase tracking-[0.2em] border-b border-border/60 pb-2">
          // Tech Stack & References
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Tech Stack (comma separated)</label>
            <input
              value={techStack}
              onChange={(e) => setTechStack(e.target.value)}
              placeholder="React, Tailwind, Node.js, Supabase"
              className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground"
              id="project-form-tech-stack"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Tags (comma separated)</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Web, Mobile, Open Source, Security"
              className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground"
              id="project-form-tags"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">GitHub URL</label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground"
              id="project-form-github-url"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Live URL</label>
            <input
              type="url"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              placeholder="https://demo.com"
              className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground"
              id="project-form-live-url"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Thumbnail Image URL</label>
            <input
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://image-host.com/cover.png"
              className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground"
              id="project-form-thumbnail"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Completion Date</label>
            <input
              type="date"
              value={completionDate}
              onChange={(e) => setCompletionDate(e.target.value)}
              className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground"
              id="project-form-completion-date"
            />
          </div>
        </div>
      </div>

      {/* Achievements & Attributes */}
      <div className="bg-card ring-1 ring-border rounded-lg p-6 space-y-4">
        <h2 className="font-mono text-[11px] text-phosphor uppercase tracking-[0.2em] border-b border-border/60 pb-2">
          // Achievements & Indexing
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5 flex flex-col justify-center">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Featured Flag</label>
            <label className="relative inline-flex items-center cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="sr-only peer"
                id="project-form-featured"
              />
              <div className="w-9 h-5 bg-background peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-muted-foreground peer-checked:after:bg-void after:border-none after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-phosphor"></div>
              <span className="ml-2 font-mono text-[10px] text-muted-foreground uppercase">Show on Front Page</span>
            </label>
          </div>
          
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Order Index</label>
            <input
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(parseInt(e.target.value) || 0)}
              className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground"
              id="project-form-order-index"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Achievements / Bullet Points (one per line)</label>
          <textarea
            value={achievements}
            onChange={(e) => setAchievements(e.target.value)}
            rows={4}
            placeholder="Increased system efficiency by 40%&#10;Integrated third-party auth via OAuth2"
            className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground resize-none"
            id="project-form-achievements"
          />
        </div>
      </div>

      {/* Sticky Save Bar */}
      <div className="sticky bottom-4 z-10 bg-panel/90 backdrop-blur ring-1 ring-border rounded-xl p-4 flex items-center justify-end shadow-phosphor-soft">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-phosphor text-void font-semibold rounded-lg hover:shadow-phosphor active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed font-mono text-sm uppercase tracking-widest"
          id="project-form-submit-btn"
        >
          {saving ? (
            <><Loader2 className="size-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="size-4" /> Save Project</>
          )}
        </button>
      </div>
    </form>
  );
}
