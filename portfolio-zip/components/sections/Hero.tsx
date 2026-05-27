"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Download, GitBranch, Link as LinkIcon, AtSign, Mail } from "lucide-react";
import type { Profile } from "@/lib/supabase/types";

interface HeroProps {
  profile: Profile;
}

export function Hero({ profile }: HeroProps) {
  const roles = profile.roles || ["/usr/bin/developer", "/usr/bin/builder"];
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const target = roles[idx];
    let i = 0;
    setTyped("");
    const typer = setInterval(() => {
      i++;
      setTyped(target.slice(0, i));
      if (i >= target.length) {
        clearInterval(typer);
        setTimeout(() => setIdx((p) => (p + 1) % roles.length), 2200);
      }
    }, 55);
    return () => clearInterval(typer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  const socials = [
    { Icon: GitBranch, href: profile.github_url || "#", label: "GitHub" },
    { Icon: LinkIcon, href: profile.linkedin_url || "#", label: "LinkedIn" },
    { Icon: AtSign, href: profile.twitter_url || "#", label: "Twitter" },
    { Icon: Mail, href: profile.email ? `mailto:${profile.email}` : "#contact", label: "Email" },
  ];

  const terminalLines = [
    { p: "$", t: "whoami", k: "in" as const },
    { t: `${profile.name?.toLowerCase() || "developer"} — ${profile.title || "Full-Stack Engineer"}`, k: "out" as const },
    { p: "$", t: "cat ./focus.txt", k: "in" as const },
    { t: profile.bio?.slice(0, 60) || "building great things", k: "out" as const },
    { p: "$", t: "git log --oneline -1", k: "in" as const },
    { t: `${profile.stats?.commits || 0} commits · ${profile.stats?.streak || 0}d streak`, k: "out" as const },
    { p: "$", t: "nmap -sV recruiters.io", k: "in" as const },
    { t: "PORT 443/tcp open  hire/https  status=READY", k: "phos" as const },
  ];

  return (
    <section
      id="top"
      className="relative pt-32 pb-28 overflow-hidden border-b border-border/60"
    >
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[420px] bg-phosphor/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-7 flex flex-col items-start gap-8"
          >
            {/* Status badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-2.5 py-1 bg-card/60 ring-1 ring-border rounded-md glass-card"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-phosphor opacity-60 animate-ping" />
                <span className="relative inline-flex size-2 rounded-full bg-phosphor" />
              </span>
              <span className="text-[10px] font-mono tracking-[0.22em] text-muted-foreground uppercase">
                System Status:{" "}
                {profile.status === "available"
                  ? "Accepting Briefings"
                  : profile.status === "busy"
                  ? "Limited Availability"
                  : "Unavailable"}
              </span>
            </motion.div>

            <div className="space-y-5">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-5xl md:text-7xl font-medium text-foreground tracking-tight leading-[0.95]"
              >
                {profile.name || "Your Name"}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="h-10 flex items-center"
              >
                <span className="font-mono text-phosphor text-lg md:text-2xl text-glow">
                  $ {typed}
                  <span className="inline-block w-2 h-5 ml-1 bg-phosphor align-middle animate-blink" />
                </span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="text-base md:text-lg text-muted-foreground max-w-[58ch] leading-relaxed"
              >
                {profile.bio || "Developer and builder of things."}
              </motion.p>
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap gap-3"
            >
              <button
                onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
                className="group inline-flex items-center gap-2 bg-phosphor text-void px-4 py-2.5 text-sm font-semibold rounded ring-1 ring-phosphor hover:shadow-phosphor active:scale-[0.98] transition-all"
              >
                View Dossier
                <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" />
              </button>

              <button
                onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center gap-2 py-2.5 px-4 bg-card text-foreground text-sm font-medium ring-1 ring-border hover:ring-phosphor/40 transition-colors rounded"
              >
                <Mail className="size-4" />
                Open Uplink
              </button>

              {profile.resume_url && (
                <a
                  href={profile.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-2 py-2.5 px-4 bg-card text-foreground text-sm font-medium ring-1 ring-border hover:ring-phosphor/40 transition-colors rounded"
                >
                  <Download className="size-4" />
                  Resume.pdf
                </a>
              )}
            </motion.div>

            {/* Social links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-1 pt-2"
            >
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="size-9 grid place-items-center rounded ring-1 ring-border/60 text-muted-foreground hover:text-phosphor hover:ring-phosphor/40 transition-colors"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </motion.div>

            {/* Stats */}
            {profile.stats && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="grid grid-cols-3 sm:grid-cols-5 gap-px bg-border/60 mt-2 w-full max-w-sm"
              >
                {[
                  [String(profile.stats.ctfs ?? 0), "CTFs"],
                  [String(profile.stats.vulnerabilities ?? 0), "Vulns"],
                  [String(profile.stats.commits ?? "0") + (Number(profile.stats.commits) > 999 ? "" : ""), "Commits"],
                  [String(profile.stats.streak ?? 0) + "d", "Streak"],
                  [String(profile.stats.projects ?? 0), "Projects"],
                ].map(([n, l]) => (
                  <div key={l} className="bg-background p-3">
                    <div className="font-mono text-xl text-phosphor text-glow">{n}</div>
                    <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mt-0.5">{l}</div>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* RIGHT — Terminal */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="lg:col-span-5 w-full"
          >
            <div className="relative bg-card/80 ring-1 ring-border rounded-lg overflow-hidden shadow-phosphor-soft animate-flicker">
              <div className="flex items-center justify-between px-3 py-2 bg-secondary/40 border-b border-border">
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                  <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                  <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground tracking-wider">
                  root@{profile.name?.toLowerCase().replace(/\s+/g, "-") || "portfolio"}:~
                </span>
                <span className="size-4" />
              </div>

              <div className="p-5 font-mono text-[13px] leading-relaxed space-y-1.5 min-h-[320px]">
                {terminalLines.map((l, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                    className="flex gap-3"
                  >
                    {l.p && <span className="text-phosphor shrink-0">{l.p}</span>}
                    <span
                      className={
                        l.k === "in"
                          ? "text-foreground"
                          : l.k === "phos"
                          ? "text-phosphor text-glow"
                          : "text-muted-foreground"
                      }
                    >
                      {l.t}
                    </span>
                  </motion.div>
                ))}
                <div className="flex gap-3 pt-2 text-phosphor">
                  <span>$</span>
                  <span className="inline-block w-2 h-4 bg-phosphor animate-blink" />
                </div>
              </div>

              <div className="absolute bottom-2 right-3 hidden sm:flex flex-col items-end opacity-40 pointer-events-none">
                <span className="text-[8px] font-mono text-phosphor">CPU 12.4%</span>
                <span className="text-[8px] font-mono text-phosphor">MEM 4.2GB</span>
                <span className="text-[8px] font-mono text-phosphor">LOSS 0%</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
