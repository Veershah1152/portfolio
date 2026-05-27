"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowUpRight, GitBranch, ExternalLink, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/lib/supabase/types";
import { SectionHeader } from "./About";
import { cn, padStart } from "@/lib/utils";

interface ProjectsProps {
  projects: Project[];
}

const statusColors: Record<string, string> = {
  STABLE: "text-phosphor bg-phosphor/10 ring-phosphor/30",
  BETA: "text-amber-flare bg-amber-flare/10 ring-amber-flare/30",
  ALPHA: "text-orange-400 bg-orange-400/10 ring-orange-400/30",
  WIP: "text-blue-400 bg-blue-400/10 ring-blue-400/30",
  ARCHIVED: "text-muted-foreground bg-secondary ring-border",
};

function ProjectCard({ p, index }: { p: Project; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group relative bg-card ring-1 ring-border hover:ring-phosphor/30 transition-all p-1 rounded-md"
    >
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-foreground font-medium text-lg group-hover:text-phosphor transition-colors">
              {p.title}
            </h3>
            <p className="text-[11px] font-mono text-muted-foreground tracking-wider">
              {p.category && `CAT: ${p.category.toUpperCase()}`}
            </p>
          </div>
          <span className={cn(
            "text-[10px] font-mono px-2 py-0.5 rounded ring-1",
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
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-700"
            />
          ) : (
            <div className="absolute inset-0 grid-bg opacity-30 flex items-center justify-center">
              <span className="font-mono text-[10px] text-muted-foreground tracking-widest">
                NO PREVIEW
              </span>
            </div>
          )}
          <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
          {p.featured && (
            <div className="absolute top-2 right-2 font-mono text-[9px] tracking-widest text-phosphor bg-background/70 px-1.5 py-0.5 rounded border border-phosphor/30">
              FEATURED
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {p.short_description}
        </p>

        {/* Stack chips */}
        {p.tech_stack && p.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {p.tech_stack.slice(0, 5).map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-secondary text-muted-foreground rounded"
              >
                {s}
              </span>
            ))}
            {p.tech_stack.length > 5 && (
              <span className="px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                +{p.tech_stack.length - 5}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 pt-3 border-t border-border/60">
          {p.github_url && (
            <a
              href={p.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:text-phosphor transition-colors"
            >
              <GitBranch className="size-3.5" /> Source
            </a>
          )}
          {p.live_url && (
            <a
              href={p.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:text-phosphor transition-colors"
            >
              <ExternalLink className="size-3.5" /> Live
            </a>
          )}
          <div className="h-px flex-1 bg-border/60" />
          <Link
            href={`/projects/${p.slug}`}
            className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-phosphor hover:text-foreground transition-colors"
          >
            Details <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export function Projects({ projects }: ProjectsProps) {
  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))];
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name" | "featured">("featured");

  const filtered = projects
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
    <section id="projects" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          index="02"
          label="Repository Index"
          title="Featured deployments"
          right={
            <span className="hidden md:block font-mono text-[10px] text-muted-foreground tracking-wider">
              TOTAL_RECORDS: {padStart(projects.length)}
            </span>
          }
        />

        {/* Controls */}
        <div className="mt-10 space-y-4">
          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-9 pr-3 py-2 bg-card/60 ring-1 ring-border focus:ring-phosphor/60 outline-none rounded font-mono text-sm text-foreground placeholder:text-muted-foreground/50 transition-all"
                id="project-search"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 bg-card/60 ring-1 ring-border rounded font-mono text-[11px] text-muted-foreground outline-none hover:ring-phosphor/40 transition-colors cursor-pointer"
              id="project-sort"
            >
              <option value="featured">Sort: Featured</option>
              <option value="date">Sort: Newest</option>
              <option value="name">Sort: Name A-Z</option>
            </select>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
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
        </div>

        {/* Grid */}
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-16 text-center py-16 border border-dashed border-border/60 rounded-lg"
            >
              <p className="font-mono text-sm text-muted-foreground">
                No projects match your search.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              layout
              className="grid md:grid-cols-2 gap-6 mt-10"
            >
              {filtered.map((p, i) => (
                <ProjectCard key={p.id} p={p} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {projects.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-5 py-2.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground ring-1 ring-border hover:ring-phosphor/40 hover:text-phosphor rounded transition-all"
            >
              View All Projects <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
