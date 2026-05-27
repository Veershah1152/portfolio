"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, X, Edit2, ChevronDown, ChevronUp, Loader2,
  Briefcase, GraduationCap, Award, Zap, BookOpen, Code2, User,
  Eye, TrendingUp, AlertCircle, CheckCircle2, ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import type { ReviewItem } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ─── Type Icons ───────────────────────────────────────────────────────────────
const typeConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  profile: { icon: User, label: "Profile", color: "text-blue-400" },
  experience: { icon: Briefcase, label: "Experience", color: "text-phosphor" },
  education: { icon: GraduationCap, label: "Education", color: "text-phosphor" },
  certification: { icon: Award, label: "Certification", color: "text-amber-flare" },
  skill: { icon: Zap, label: "Skill", color: "text-phosphor" },
  post: { icon: BookOpen, label: "Post", color: "text-purple-400" },
  project: { icon: Code2, label: "Project", color: "text-phosphor" },
};

// ─── Score Badge ─────────────────────────────────────────────────────────────
function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "text-phosphor bg-phosphor/10 ring-phosphor/30" :
    score >= 60 ? "text-amber-flare bg-amber-flare/10 ring-amber-flare/30" :
    "text-muted-foreground bg-secondary ring-border";

  return (
    <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded ring-1", color)}>
      {score}% relevant
    </span>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────────────
function ReviewCard({
  item,
  onAction,
  onEdit,
}: {
  item: ReviewItem;
  onAction: (id: string, action: "include" | "skip" | "edit") => void;
  onEdit: (id: string, field: string, value: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const config = typeConfig[item.type] || typeConfig.experience;
  const Icon = config.icon;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = item.data as any;

  const getTitle = () => {
    switch (item.type) {
      case "profile": return `${data.firstName || ""} ${data.lastName || ""}`.trim() || "Profile";
      case "experience": return data.title || "Position";
      case "education": return data.degreeName || data.schoolName || "Education";
      case "certification": return data.name || "Certification";
      case "skill": return data.name || "Skill";
      case "post": return data.shareCommentary?.slice(0, 60) || "LinkedIn Post";
      case "project": return data.title || "Project";
      default: return "Item";
    }
  };

  const getSubtitle = () => {
    switch (item.type) {
      case "experience": return data.companyName;
      case "education": return data.schoolName;
      case "certification": return data.authority;
      case "post": return data.date ? new Date(data.date).toLocaleDateString() : "";
      case "project": return data.associatedWith;
      default: return "";
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-card ring-1 rounded-lg overflow-hidden transition-all",
        item.action === "include" ? "ring-phosphor/30" :
        item.action === "skip" ? "ring-border/40 opacity-60" :
        "ring-border/60"
      )}
    >
      {/* Card header */}
      <div className="p-4 flex items-start gap-3">
        <div className={cn("mt-0.5 shrink-0", config.color)}>
          <Icon className="size-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              {config.label}
            </span>
            <ScoreBadge score={item.relevanceScore} />
          </div>
          <h3 className="text-sm font-medium text-foreground mt-0.5 truncate">{getTitle()}</h3>
          {getSubtitle() && (
            <p className="text-[12px] font-mono text-muted-foreground">{getSubtitle()}</p>
          )}
          {item.aiSuggestion && (
            <p className="text-[11px] text-muted-foreground/70 mt-1 leading-relaxed">
              💡 {item.aiSuggestion}
            </p>
          )}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="shrink-0 size-7 grid place-items-center rounded hover:bg-secondary/50 transition-colors text-muted-foreground"
        >
          {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        </button>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-border/40 pt-3 space-y-3">
              {/* Raw data preview */}
              <div className="bg-background/60 rounded p-3 font-mono text-[11px] text-muted-foreground space-y-1 max-h-40 overflow-y-auto">
                {Object.entries(data)
                  .filter(([, v]) => v && String(v).trim())
                  .map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <span className="text-phosphor/60 shrink-0">{k}:</span>
                      <span className="truncate">{String(v).slice(0, 100)}</span>
                    </div>
                  ))}
              </div>

              {/* Edit mode for key fields */}
              {editing && item.type === "experience" && (
                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Edit Description
                  </label>
                  <textarea
                    defaultValue={data.description || ""}
                    onChange={(e) => onEdit(item.id, "description", e.target.value)}
                    rows={3}
                    className="w-full bg-background/60 ring-1 ring-border focus:ring-phosphor outline-none rounded px-2 py-1.5 font-mono text-[12px] text-foreground resize-none"
                  />
                </div>
              )}
              {editing && item.type === "post" && (
                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Edit Content
                  </label>
                  <textarea
                    defaultValue={data.shareCommentary || ""}
                    onChange={(e) => onEdit(item.id, "shareCommentary", e.target.value)}
                    rows={4}
                    className="w-full bg-background/60 ring-1 ring-border focus:ring-phosphor outline-none rounded px-2 py-1.5 font-mono text-[12px] text-foreground resize-none"
                  />
                </div>
              )}

              <button
                onClick={() => setEditing(!editing)}
                className="text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <Edit2 className="size-3" />
                {editing ? "Done editing" : "Edit before importing"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex items-center gap-2 px-4 py-3 bg-secondary/20 border-t border-border/40">
        <button
          onClick={() => onAction(item.id, "include")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-mono uppercase tracking-wider transition-all",
            item.action === "include"
              ? "bg-phosphor text-void ring-1 ring-phosphor"
              : "text-muted-foreground ring-1 ring-border hover:text-phosphor hover:ring-phosphor/40"
          )}
        >
          <Check className="size-3" /> Include
        </button>
        <button
          onClick={() => onAction(item.id, "skip")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-mono uppercase tracking-wider transition-all",
            item.action === "skip"
              ? "bg-destructive/20 text-destructive ring-1 ring-destructive/40"
              : "text-muted-foreground ring-1 ring-border hover:text-destructive hover:ring-destructive/30"
          )}
        >
          <X className="size-3" /> Skip
        </button>
        <div className="flex-1" />
        <span className="text-[10px] font-mono text-muted-foreground">
          {item.action === "include" ? "✓ will import" : item.action === "skip" ? "✗ skipping" : "pending"}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Portfolio Preview Panel ──────────────────────────────────────────────────
function PortfolioPreview({ items }: { items: ReviewItem[] }) {
  const included = items.filter((i) => i.action === "include");
  const byType = included.reduce<Record<string, ReviewItem[]>>((acc, item) => {
    acc[item.type] = [...(acc[item.type] || []), item];
    return acc;
  }, {});

  return (
    <div className="sticky top-4 space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="size-4 text-phosphor" />
        <h2 className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          Portfolio Preview
        </h2>
        <span className="ml-auto font-mono text-[10px] text-phosphor">
          {included.length} items selected
        </span>
      </div>

      {Object.keys(byType).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground font-mono text-sm border border-dashed border-border/60 rounded-lg">
          Mark items as &quot;Include&quot; to preview
        </div>
      ) : (
        Object.entries(byType).map(([type, typeItems]) => {
          const config = typeConfig[type];
          if (!config) return null;
          const Icon = config.icon;
          return (
            <div key={type} className="bg-card/60 ring-1 ring-border/60 rounded-lg p-4">
              <div className={cn("flex items-center gap-2 mb-3", config.color)}>
                <Icon className="size-4" />
                <span className="font-mono text-[11px] uppercase tracking-wider">{config.label}</span>
                <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                  {typeItems.length}
                </span>
              </div>
              <div className="space-y-2">
                {typeItems.slice(0, 3).map((item) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const d = item.data as any;
                  const title =
                    d.title || d.name || d.degreeName || d.schoolName ||
                    d.shareCommentary?.slice(0, 40) || "Item";
                  return (
                    <div key={item.id} className="flex items-center gap-2 text-[12px] font-mono">
                      <Check className="size-3 text-phosphor shrink-0" />
                      <span className="text-foreground truncate">{title}</span>
                    </div>
                  );
                })}
                {typeItems.length > 3 && (
                  <p className="text-[11px] font-mono text-muted-foreground">
                    +{typeItems.length - 3} more...
                  </p>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ─── Main Split-View Page ─────────────────────────────────────────────────────
export default function LinkedInReviewPage() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [filterType, setFilterType] = useState("all");
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = sessionStorage.getItem("linkedin_review_items");
    const storedSummary = sessionStorage.getItem("linkedin_review_summary");
    if (!stored) {
      router.push("/admin/linkedin");
      return;
    }
    setItems(JSON.parse(stored));
    if (storedSummary) setSummary(JSON.parse(storedSummary));
  }, [router]);

  const handleAction = useCallback((id: string, action: "include" | "skip" | "edit") => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, action } : item))
    );
  }, []);

  const handleEdit = useCallback((id: string, field: string, value: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, edited: { ...(item.edited || {}), [field]: value } }
          : item
      )
    );
  }, []);

  const handleSelectAll = (type: string, action: "include" | "skip") => {
    setItems((prev) =>
      prev.map((item) =>
        type === "all" || item.type === type ? { ...item, action } : item
      )
    );
  };

  const handlePublish = async () => {
    const included = items.filter((i) => i.action === "include");
    if (included.length === 0) {
      toast.error("Select at least one item to import.");
      return;
    }
    setPublishing(true);
    try {
      const res = await fetch("/api/linkedin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Import complete! ${data.message}`);
      setPublished(true);
      sessionStorage.removeItem("linkedin_review_items");
      sessionStorage.removeItem("linkedin_review_summary");
    } catch (err) {
      toast.error("Import failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setPublishing(false);
    }
  };

  const types = ["all", ...Array.from(new Set(items.map((i) => i.type)))];
  const filtered = filterType === "all" ? items : items.filter((i) => i.type === filterType);
  const included = items.filter((i) => i.action === "include");
  const skipped = items.filter((i) => i.action === "skip");

  if (published) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <CheckCircle2 className="size-16 text-phosphor" />
        <div>
          <h2 className="text-2xl font-medium text-foreground">Import Complete!</h2>
          <p className="text-muted-foreground mt-2">Your portfolio has been updated with LinkedIn data.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin" className="px-5 py-2.5 bg-phosphor text-void font-mono text-sm rounded hover:shadow-phosphor transition-all uppercase tracking-wider">
            View Dashboard
          </Link>
          <Link href="/" target="_blank" className="px-5 py-2.5 ring-1 ring-border text-muted-foreground hover:text-foreground font-mono text-sm rounded transition-all uppercase tracking-wider">
            View Portfolio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-8 md:pt-0">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="border-l-2 border-phosphor/40 pl-5">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/linkedin" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="size-4" />
            </Link>
            <p className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">Review & Import</p>
          </div>
          <h1 className="text-xl font-medium text-foreground">
            Review LinkedIn Data
          </h1>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="text-phosphor">{included.length} include</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{skipped.length} skip</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-foreground">{items.length - included.length - skipped.length} pending</span>
        </div>
      </div>

      {/* Summary banner */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {Object.entries(summary).filter(([k]) => k !== "total" && k !== "autoInclude" && k !== "autoSkip").map(([key, val]) => (
          <div key={key} className="bg-card/40 ring-1 ring-border/60 rounded p-2 text-center">
            <div className="font-mono text-lg text-phosphor">{val}</div>
            <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{key}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Type filter */}
        <div className="flex flex-wrap gap-1.5">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                "px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded ring-1 transition-all",
                filterType === type
                  ? "bg-phosphor text-void ring-phosphor"
                  : "text-muted-foreground ring-border hover:ring-phosphor/30"
              )}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Bulk actions */}
        <div className="flex gap-2">
          <button
            onClick={() => handleSelectAll(filterType, "include")}
            className="text-[10px] font-mono text-phosphor hover:text-foreground transition-colors uppercase tracking-wider"
          >
            Include All
          </button>
          <span className="text-muted-foreground">·</span>
          <button
            onClick={() => handleSelectAll(filterType, "skip")}
            className="text-[10px] font-mono text-muted-foreground hover:text-destructive transition-colors uppercase tracking-wider"
          >
            Skip All
          </button>
        </div>
      </div>

      {/* Main split layout */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Review cards */}
        <div className="lg:col-span-3 space-y-3">
          <AnimatePresence>
            {filtered.map((item) => (
              <ReviewCard
                key={item.id}
                item={item}
                onAction={handleAction}
                onEdit={handleEdit}
              />
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground font-mono text-sm border border-dashed border-border/60 rounded-lg">
              No items in this category.
            </div>
          )}
        </div>

        {/* Right: Portfolio preview */}
        <div className="lg:col-span-2">
          <PortfolioPreview items={items} />
        </div>
      </div>

      {/* Publish bar */}
      <div className="sticky bottom-4 bg-panel/90 backdrop-blur ring-1 ring-border rounded-xl p-4 flex items-center gap-4 shadow-phosphor-soft">
        <div className="flex-1">
          <p className="font-mono text-sm text-foreground">
            {included.length} items selected for import
          </p>
          <p className="font-mono text-[11px] text-muted-foreground">
            Blog posts will be saved as drafts — review before publishing.
          </p>
        </div>
        <button
          onClick={handlePublish}
          disabled={publishing || included.length === 0}
          className="flex items-center gap-2 px-6 py-2.5 bg-phosphor text-void font-semibold rounded-lg hover:shadow-phosphor active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed font-mono text-sm uppercase tracking-widest shrink-0"
          id="linkedin-publish-btn"
        >
          {publishing ? (
            <><Loader2 className="size-4 animate-spin" /> Importing...</>
          ) : (
            <><TrendingUp className="size-4" /> Import to Portfolio</>
          )}
        </button>
      </div>
    </div>
  );
}
