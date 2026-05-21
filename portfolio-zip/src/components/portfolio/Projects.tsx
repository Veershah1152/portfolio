import { useState } from "react";
import { SectionHeader } from "./About";
import { ArrowUpRight, Github } from "lucide-react";
import imgMusic from "@/assets/project-music.jpg";
import imgAi from "@/assets/project-ai.jpg";
import imgSec from "@/assets/project-sec.jpg";
import imgLink from "@/assets/project-linkedin.jpg";

type Project = {
  title: string;
  tag: string;
  status: "STABLE" | "BETA" | "ALPHA";
  category: "Android" | "AI" | "Security" | "Web";
  blurb: string;
  stack: string[];
  img: string;
};

const projects: Project[] = [
  {
    title: "Kotlin Music Architecture",
    tag: "ANDROID_LATEST",
    status: "STABLE",
    category: "Android",
    blurb:
      "Offline-first Android music player with custom audio pipeline, ExoPlayer caching, and a coroutine-driven sync layer.",
    stack: ["Kotlin", "Compose", "Room", "ExoPlayer"],
    img: imgMusic,
  },
  {
    title: "AI Resume Parser",
    tag: "NLP_NEURAL_NET",
    status: "BETA",
    category: "AI",
    blurb:
      "LLM-backed ATS analyzer that scores resumes against job descriptions and proposes targeted keyword injections.",
    stack: ["Python", "OpenAI", "FastAPI", "React"],
    img: imgAi,
  },
  {
    title: "Aegis Vulnerability Scanner",
    tag: "SEC_TOOLS",
    status: "BETA",
    category: "Security",
    blurb:
      "Lightweight CLI that orchestrates nmap, nikto, and custom probes into a single annotated penetration-test report.",
    stack: ["Python", "Bash", "Docker"],
    img: imgSec,
  },
  {
    title: "LinkedIn Connector",
    tag: "NETWORK_GRAPH",
    status: "ALPHA",
    category: "Web",
    blurb:
      "Browser extension that maps your second-degree network and ranks warm intros by recruiter activity signals.",
    stack: ["TypeScript", "WXT", "D3"],
    img: imgLink,
  },
];

const filters = ["All", "Android", "AI", "Security", "Web"] as const;

export function Projects() {
  const [active, setActive] = useState<(typeof filters)[number]>("All");
  const list = active === "All" ? projects : projects.filter((p) => p.category === active);

  return (
    <section id="projects" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          index="02"
          label="Repository Index"
          title="Featured deployments"
          right={
            <span className="hidden md:block font-mono text-[10px] text-muted-foreground tracking-wider">
              TOTAL_RECORDS: {String(projects.length).padStart(3, "0")}
            </span>
          }
        />

        <div className="mt-10 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.2em] rounded ring-1 transition-all ${
                active === f
                  ? "bg-phosphor text-primary-foreground ring-phosphor shadow-phosphor"
                  : "bg-card text-muted-foreground ring-border hover:ring-phosphor/40 hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-10">
          {list.map((p) => (
            <ProjectCard key={p.title} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ p }: { p: Project }) {
  return (
    <article className="group relative bg-card ring-1 ring-border hover:ring-phosphor/30 transition-all p-1 rounded-md">
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-foreground font-medium text-lg group-hover:text-phosphor transition-colors">
              {p.title}
            </h3>
            <p className="text-[11px] font-mono text-muted-foreground tracking-wider">
              TAG: {p.tag}
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 bg-secondary text-muted-foreground rounded">
            {p.status}
          </span>
        </div>

        <div className="relative w-full aspect-video bg-secondary/40 rounded overflow-hidden ring-1 ring-border/60">
          <img
            src={p.img}
            alt={p.title}
            loading="lazy"
            width={1024}
            height={576}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-700"
          />
          <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
          <div className="absolute top-2 left-2 font-mono text-[9px] tracking-widest text-phosphor/80 bg-background/70 px-1.5 py-0.5 rounded">
            {p.category.toUpperCase()}
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">{p.blurb}</p>

        <div className="flex flex-wrap gap-1.5">
          {p.stack.map((s) => (
            <span
              key={s}
              className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-secondary text-muted-foreground rounded"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-border/60">
          <a
            href="#"
            className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:text-phosphor transition-colors"
          >
            <Github className="size-3.5" /> Source
          </a>
          <div className="h-px flex-1 bg-border/60" />
          <a
            href="#"
            className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-phosphor hover:text-foreground transition-colors"
          >
            Initialize <ArrowUpRight className="size-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}
