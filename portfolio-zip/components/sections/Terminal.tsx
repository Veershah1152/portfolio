"use client";

import { useEffect, useRef, useState } from "react";
import { SectionHeader } from "./About";

type Line = { p?: string; t: string; k?: "in" | "out" | "phos" | "err" };

const helpLines: Line[] = [
  { t: "Available commands:", k: "out" },
  { t: "  whoami     — operator profile", k: "out" },
  { t: "  skills     — stack telemetry", k: "out" },
  { t: "  projects   — deployments index", k: "out" },
  { t: "  blog       — latest posts", k: "out" },
  { t: "  contact    — open uplink", k: "out" },
  { t: "  clear      — wipe buffer", k: "out" },
];

function run(cmd: string, dynamicData: DynamicData): Line[] {
  const c = cmd.trim().toLowerCase();
  if (!c) return [];
  if (c === "help") return helpLines;
  if (c === "whoami")
    return [{ t: `${dynamicData.name} — ${dynamicData.title}`, k: "phos" }];
  if (c === "skills")
    return dynamicData.skills.map((s) => ({ t: s, k: "out" as const }));
  if (c === "projects")
    return dynamicData.projects.map((p) => ({ t: `» ${p}`, k: "phos" as const }));
  if (c === "blog")
    return dynamicData.posts.length > 0
      ? dynamicData.posts.map((p) => ({ t: `📝 ${p}`, k: "out" as const }))
      : [{ t: "No posts published yet.", k: "out" }];
  if (c === "contact")
    return [
      { t: `email   ▸ ${dynamicData.email || "contact@portfolio.dev"}`, k: "out" },
      { t: "→ scroll to #contact for secure uplink", k: "phos" },
    ];
  if (c === "clear") return [{ t: "__CLEAR__" }];
  return [{ t: `bash: ${cmd}: command not found — try 'help'`, k: "err" }];
}

interface DynamicData {
  name: string;
  title: string;
  email?: string;
  skills: string[];
  projects: string[];
  posts: string[];
}

interface TerminalProps {
  dynamicData: DynamicData;
}

export function Terminal({ dynamicData }: TerminalProps) {
  const [history, setHistory] = useState<Line[]>([
    { t: "portfolio-shell v2.0 — type 'help' to list commands", k: "out" },
    { t: "Type 'whoami', 'projects', 'skills', 'blog', 'contact'", k: "out" },
  ]);
  const [input, setInput] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scroller.current) {
      scroller.current.scrollTop = scroller.current.scrollHeight;
    }
  }, [history]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const cmd = input;
    const out = run(cmd, dynamicData);
    if (out[0]?.t === "__CLEAR__") {
      setHistory([]);
    } else {
      setHistory((h) => [...h, { p: "$", t: cmd, k: "in" }, ...out]);
    }
    setInput("");
  }

  return (
    <section id="terminal" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeader index="04" label="Live Shell" title="Try it yourself" />

        <div className="mt-12 relative bg-card/80 ring-1 ring-border rounded-lg overflow-hidden shadow-phosphor-soft">
          {/* Title bar */}
          <div className="flex items-center justify-between px-3 py-2 bg-secondary/40 border-b border-border">
            <div className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-muted-foreground/30" />
              <span className="size-2.5 rounded-full bg-muted-foreground/30" />
              <span className="size-2.5 rounded-full bg-muted-foreground/30" />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground tracking-wider">
              visitor@portfolio:~$
            </span>
            <span className="size-4" />
          </div>

          {/* Output */}
          <div
            ref={scroller}
            className="p-6 font-mono text-[13px] leading-relaxed h-[360px] overflow-y-auto space-y-1"
          >
            {history.map((l, i) => (
              <div key={i} className="flex gap-3">
                {l.p && <span className="text-phosphor shrink-0">{l.p}</span>}
                <span
                  className={
                    l.k === "in"
                      ? "text-foreground"
                      : l.k === "phos"
                      ? "text-phosphor"
                      : l.k === "err"
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }
                >
                  {l.t}
                </span>
              </div>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={submit}
            className="flex items-center gap-3 px-6 py-3 border-t border-border bg-background/60"
          >
            <span className="text-phosphor font-mono text-sm">$</span>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder="type 'help' and press enter"
              className="flex-1 bg-transparent font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
              aria-label="Terminal input"
              id="terminal-input"
            />
            <span className="inline-block w-2 h-4 bg-phosphor animate-blink" />
          </form>
        </div>
      </div>
    </section>
  );
}
