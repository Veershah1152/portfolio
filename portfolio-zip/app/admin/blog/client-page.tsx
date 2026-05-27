"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Eye, Clock, Calendar, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Post } from "@/lib/supabase/types";

interface ClientBlogListPageProps {
  initialPosts: Post[];
}

export function ClientBlogListPage({ initialPosts }: ClientBlogListPageProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const supabase = createClient();

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the post "${title}"?`)) return;

    try {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;

      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Post deleted successfully");
    } catch (err) {
      toast.error("Failed to delete post");
      console.error(err);
    }
  };

  const handleTogglePublish = async (post: Post) => {
    const nextPublished = !post.published;
    try {
      const { error } = await supabase
        .from("posts")
        .update({ published: nextPublished })
        .eq("id", post.id);

      if (error) throw error;

      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, published: nextPublished } : p))
      );
      toast.success(nextPublished ? "Post published!" : "Post set to draft");
    } catch (err) {
      toast.error("Failed to update post status");
      console.error(err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Action */}
      <div className="flex justify-between items-center">
        <div className="font-mono text-xs text-muted-foreground">
          POSTS_COUNT: {posts.length.toString().padStart(2, "0")}
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-phosphor text-void font-mono text-xs uppercase tracking-widest rounded hover:shadow-phosphor transition-all"
          id="admin-new-post-btn"
        >
          <Plus className="size-3.5" /> New Entry
        </Link>
      </div>

      {/* List feed */}
      <div className="space-y-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-card/45 border border-border/60 hover:bg-card/60 p-5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-muted-foreground">
                <span className="text-phosphor uppercase">{post.category || "General"}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Calendar className="size-3" /> {formatDate(post.created_at)}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock className="size-3" /> {post.reading_time || 5} min</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Eye className="size-3" /> {post.views || 0} views</span>
              </div>
              <h3 className="text-base text-foreground font-medium truncate">{post.title}</h3>
              {post.excerpt && (
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1 max-w-[80ch]">
                  {post.excerpt}
                </p>
              )}
            </div>

            {/* Quick Status / Actions */}
            <div className="flex items-center gap-4 shrink-0 self-end md:self-auto">
              {/* Publish Toggle Button */}
              <button
                onClick={() => handleTogglePublish(post)}
                className={cn(
                  "px-3 py-1 font-mono text-[9px] uppercase tracking-wider rounded transition-all border",
                  post.published
                    ? "bg-phosphor/10 text-phosphor border-phosphor/20 hover:bg-phosphor/20"
                    : "bg-secondary/40 text-muted-foreground border-border hover:bg-secondary/70 hover:text-foreground"
                )}
              >
                {post.published ? "Published" : "Draft"}
              </button>

              {/* Action buttons */}
              <div className="flex gap-1">
                <Link
                  href={`/admin/blog/${post.id}`}
                  className="size-8 grid place-items-center rounded hover:bg-secondary text-muted-foreground hover:text-phosphor transition-colors border border-transparent hover:border-border/60"
                  title="Edit post"
                >
                  <Edit2 className="size-3.5" />
                </Link>
                <button
                  onClick={() => handleDelete(post.id, post.title)}
                  className="size-8 grid place-items-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors border border-transparent hover:border-destructive/20"
                  title="Delete post"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border/60 rounded-lg">
            <p className="font-mono text-sm text-muted-foreground">No entries recorded in the log. Create one or import from LinkedIn.</p>
          </div>
        )}
      </div>
    </div>
  );
}
