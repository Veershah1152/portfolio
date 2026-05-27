"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Save, BookOpen, Eye } from "lucide-react";
import Link from "next/link";
import { slugify } from "@/lib/utils";
import type { Post } from "@/lib/supabase/types";

interface PostFormProps {
  initialData?: Post;
}

export function PostForm({ initialData }: PostFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [coverUrl, setCoverUrl] = useState(initialData?.cover_url || "");
  const [category, setCategory] = useState(initialData?.category || "General");
  const [tags, setTags] = useState(initialData?.tags?.join(", ") || "");
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [published, setPublished] = useState(initialData?.published || false);
  const [readingTime, setReadingTime] = useState(initialData?.reading_time || 5);
  
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
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
      excerpt: excerpt.trim() || null,
      content: content || "",
      cover_url: coverUrl.trim() || null,
      category: category.trim() || "General",
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      featured,
      published,
      reading_time: readingTime,
      updated_at: new Date().toISOString(),
    };

    try {
      if (isEdit) {
        const { error } = await supabase
          .from("posts")
          .update(payload)
          .eq("id", initialData.id);

        if (error) throw error;
        toast.success("Post updated successfully");
      } else {
        const { error } = await supabase
          .from("posts")
          .insert(payload);

        if (error) throw error;
        toast.success("Post created successfully");
      }
      
      router.push("/admin/blog");
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
      {/* Navigation & Preview Toggle */}
      <div className="flex justify-between items-center">
        <Link href="/admin/blog" className="inline-flex items-center gap-1 font-mono text-[10px] uppercase text-muted-foreground hover:text-phosphor transition-colors">
          <ArrowLeft className="size-3.5" /> Back to Log
        </Link>
        <button
          type="button"
          onClick={() => setPreviewMode(!previewMode)}
          className="flex items-center gap-1.5 px-3 py-1 bg-secondary text-foreground font-mono text-[10px] uppercase tracking-wider rounded border border-border/80 hover:text-phosphor transition-all"
        >
          <Eye className="size-3" /> {previewMode ? "Code Editor" : "Preview"}
        </button>
      </div>

      {!previewMode ? (
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* Main content pane */}
          <div className="lg:col-span-2 space-y-4 bg-card ring-1 ring-border rounded-lg p-6">
            <h2 className="font-mono text-[11px] text-phosphor uppercase tracking-[0.2em] border-b border-border/60 pb-2">
              {isEdit ? "// Write Transmission" : "// Compose Transmission"}
            </h2>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Title</label>
              <input
                value={title}
                onChange={handleTitleChange}
                required
                placeholder="e.g. Breaking down Next.js 15 Server Actions"
                className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground"
                id="blog-form-title"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Slug</label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  placeholder="e.g. nextjs-15-server-actions"
                  className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground"
                  id="blog-form-slug"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Category</label>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Engineering"
                  className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground"
                  id="blog-form-category"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Excerpt / Abstract</label>
              <input
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="A summary of the post for listing cards"
                className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-sm text-foreground"
                id="blog-form-excerpt"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Markdown Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={14}
                placeholder="# Introduction..."
                className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2.5 font-mono text-xs text-foreground resize-none"
                id="blog-form-content"
              />
            </div>
          </div>

          {/* Config sidebar pane */}
          <div className="space-y-6">
            <div className="bg-card ring-1 ring-border rounded-lg p-6 space-y-4">
              <h2 className="font-mono text-[11px] text-phosphor uppercase tracking-[0.2em] border-b border-border/60 pb-2">
                // Metadata
              </h2>
              
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Cover Image URL</label>
                <input
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://image-host/cover.png"
                  className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-xs text-foreground"
                  id="blog-form-cover"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Reading Time (Minutes)</label>
                <input
                  type="number"
                  value={readingTime}
                  onChange={(e) => setReadingTime(parseInt(e.target.value) || 5)}
                  className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-xs text-foreground"
                  id="blog-form-reading-time"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Tags (comma separated)</label>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Next.js, MDX, React"
                  className="w-full bg-background ring-1 ring-border focus:ring-phosphor/60 outline-none rounded px-3 py-2 font-mono text-xs text-foreground"
                  id="blog-form-tags"
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Publish Directly</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="sr-only peer"
                      id="blog-form-published"
                    />
                    <div className="w-9 h-5 bg-background peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-muted-foreground peer-checked:after:bg-void after:border-none after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-phosphor"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Featured Banner</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="sr-only peer"
                      id="blog-form-featured"
                    />
                    <div className="w-9 h-5 bg-background peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-muted-foreground peer-checked:after:bg-void after:border-none after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-phosphor"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Preview pane
        <div className="bg-card ring-1 ring-border rounded-lg p-6 space-y-6">
          <div className="border-b border-border/40 pb-4">
            <h1 className="text-2xl font-semibold text-foreground">{title || "Untitled Transmission"}</h1>
            <p className="font-mono text-[10px] text-muted-foreground mt-2">
              CATEGORY: {category.toUpperCase()} | READ_TIME: {readingTime} MIN
            </p>
          </div>
          <div className="prose prose-invert max-w-none text-muted-foreground font-mono text-xs whitespace-pre-wrap">
            {content || "No content written yet."}
          </div>
        </div>
      )}

      {/* Save trigger */}
      <div className="sticky bottom-4 z-10 bg-panel/90 backdrop-blur ring-1 ring-border rounded-xl p-4 flex items-center justify-end shadow-phosphor-soft">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-phosphor text-void font-semibold rounded-lg hover:shadow-phosphor active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed font-mono text-sm uppercase tracking-widest"
          id="blog-form-save-btn"
        >
          {saving ? (
            <><Loader2 className="size-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="size-4" /> Save Post</>
          )}
        </button>
      </div>
    </form>
  );
}
