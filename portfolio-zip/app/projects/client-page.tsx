"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, GitBranch, ExternalLink, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

interface ClientProjectsPageProps {
  initialProjects: Project[];
}

const statusColors: Record<string, string> = {
  STABLE: "text-phosphor bg-phosphor/10 ring-phosphor/30",
  BETA: "text-amber-flare bg-amber-flare/10 ring-amber-flare/30",
  ALPHA: "text-orange-400 bg-orange-400/10 ring-orange-400/30",
  WIP: "text-blue-400 bg-blue-400/10 ring-blue-400/30",
  ARCHIVED: "text-muted-foreground bg-secondary ring-border",
};

export function ClientProjectsPage({ initialProjects }: ClientProjectsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"featured" | "date" | "name">("featured");
  const [, startTransition] = useTransition();

  const categories = ["All", ...Array.from(new Set(initialProjects.map((p) => p.category).filter(Boolean)))];

  const filtered = initialProjects
    .filter((p) => {
      const matchCat = activeFilter === "All" || p.category === activeFilter;
      const matchSearch =
        !searchQuery ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.short_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tech_stack?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "featured") return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      if (sortBy === "name") return a.title.localeCompare(b.title);
      if (sortBy === "date") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return 0;
    });

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by name, tech..."
            className="w-full pl-9 pr-3 py-2 bg-card/65 ring-1 ring-border focus:ring-phosphor/60 outline-none rounded font-mono text-sm text-foreground placeholder:text-muted-foreground/50 transition-all"
            id="archive-project-search"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-2 bg-card/65 ring-1 ring-border rounded font-mono text-[11px] text-muted-foreground outline-none hover:ring-phosphor/40 transition-colors cursor-pointer"
          id="archive-project-sort"
        >
          <option value="featured">Sort: Featured First</option>
          <option value="date">Sort: Latest Code</option>
          <option value="name">Sort: Alphabetical</option>
        </select>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-border/40">
        {categories.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f!)}
            className={cn(
              "px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.2em] rounded ring-1 transition-all",
              activeFilter === f
                ? "bg-phosphor text-void ring-phosphor shadow-phosphor"
                : "bg-card text-muted-foreground ring-border hover:ring-phosphor/40 hover:text-foreground"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-24 border border-dashed border-border/60 rounded-lg"
          >
            <p className="font-mono text-sm text-muted-foreground">
              No deployments matching query in this directory.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            layout
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((p, i) => (
              <motion.article
                key={p.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, delay: i * 0.03 }}
                className="group relative bg-card ring-1 ring-border hover:ring-phosphor/30 transition-all p-1 rounded-md flex flex-col justify-between"
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <h3 className="text-foreground font-medium text-base group-hover:text-phosphor transition-colors truncate">
                        {p.title}
                      </h3>
                      <p className="text-[10px] font-mono text-muted-foreground tracking-wider truncate">
                        {p.category && `CAT: ${p.category.toUpperCase()}`}
                      </p>
                    </div>
                    <span className={cn(
                      "text-[9px] font-mono px-2 py-0.5 rounded ring-1 shrink-0",
                      statusColors[p.status] || statusColors.STABLE
                    )}>
                      {p.status}
                    </span>
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-full aspect-video bg-secondary/40 rounded overflow-hidden ring-1 ring-border/60">
                    {p.thumbnail_url ? (
                      <Image
                        src={p.thumbnail_url}
                        alt={p.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 grid-bg opacity-30 flex items-center justify-center">
                        <span className="font-mono text-[9px] text-muted-foreground tracking-widest">
                          NO PREVIEW
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
                    {p.featured && (
                      <div className="absolute top-2 right-2 font-mono text-[8px] tracking-widest text-phosphor bg-background/70 px-1.5 py-0.5 rounded border border-phosphor/30">
                        FEATURED
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {p.short_description}
                  </p>

                  {/* Tech stack */}
                  {p.tech_stack && p.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {p.tech_stack.slice(0, 4).map((s) => (
                        <span
                          key={s}
                          className="px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider bg-secondary text-muted-foreground rounded"
                        >
                          {s}
                        </span>
                      ))}
                      {p.tech_stack.length > 4 && (
                        <span className="px-1 py-0.5 text-[9px] font-mono text-muted-foreground">
                          +{p.tech_stack.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 px-5 pb-5 pt-3 border-t border-border/40">
                  {p.github_url && (
                    <a
                      href={p.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-phosphor transition-colors"
                    >
                      <GitBranch className="size-3" /> Code
                    </a>
                  )}
                  {p.live_url && (
                    <a
                      href={p.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-phosphor transition-colors"
                    >
                      <ExternalLink className="size-3" /> Live
                    </a>
                  )}
                  <div className="h-px flex-1 bg-border/40" />
                  <Link
                    href={`/projects/${p.slug}`}
                    className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-phosphor hover:text-foreground transition-colors"
                  >
                    View <ArrowUpRight className="size-3" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
