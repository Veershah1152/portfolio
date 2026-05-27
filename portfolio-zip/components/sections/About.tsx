"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { GraduationCap, Briefcase, Trophy, Award } from "lucide-react";
import { formatDateShort } from "@/lib/utils";
import type { Profile, TimelineEntry } from "@/lib/supabase/types";

interface AboutProps {
  profile: Profile;
  timeline: TimelineEntry[];
}

const iconMap: Record<string, React.ElementType> = {
  GraduationCap,
  Briefcase,
  Trophy,
  Award,
  education: GraduationCap,
  work: Briefcase,
  achievement: Trophy,
  certification: Award,
};

function SectionHeader({
  index,
  label,
  title,
  right,
}: {
  index: string;
  label: string;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-6 border-l-2 border-phosphor/40 pl-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.32em]">
          <span className="text-muted-foreground">{index}</span>
          <span className="text-phosphor">{label}</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-medium text-foreground tracking-tight">
          {title}
        </h2>
      </div>
      {right}
    </div>
  );
}

export { SectionHeader };

export function About({ profile, timeline }: AboutProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const stats = profile.stats
    ? [
        [String(profile.stats.ctfs ?? 0), "CTFs"],
        [String(profile.stats.vulnerabilities ?? 0), "Vulns"],
        [
          profile.stats.commits && profile.stats.commits > 999
            ? (profile.stats.commits / 1000).toFixed(1) + "k"
            : String(profile.stats.commits ?? 0),
          "Commits",
        ],
      ]
    : [];

  return (
    <section id="about" ref={ref} className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeader index="00" label="Operator Profile" title="The dossier so far" />

        <div className="grid lg:grid-cols-12 gap-12 mt-12">
          {/* Left: bio + stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="lg:col-span-4 space-y-6"
          >
            <p className="text-foreground/90 leading-relaxed">{profile.bio}</p>
            {profile.bio_secondary && (
              <p className="text-muted-foreground leading-relaxed text-sm">
                {profile.bio_secondary}
              </p>
            )}

            {stats.length > 0 && (
              <div className="grid grid-cols-3 gap-px bg-border/60 mt-8">
                {stats.map(([n, l]) => (
                  <div key={l} className="bg-background p-4">
                    <div className="font-mono text-2xl text-phosphor text-glow">{n}</div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
                      {l}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: timeline */}
          <ol className="lg:col-span-8 relative border-l border-border/80 pl-8 space-y-10">
            {timeline.length === 0 ? (
              <li className="text-sm text-muted-foreground font-mono">
                No timeline entries yet. Add some in the admin dashboard.
              </li>
            ) : (
              timeline.map((t, i) => {
                const IconComp = iconMap[t.icon || t.type] || Briefcase;
                return (
                  <motion.li
                    key={t.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="relative"
                  >
                    <span className="absolute -left-[41px] top-1 size-3 rounded-full bg-phosphor ring-4 ring-background shadow-phosphor" />
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-[10px] text-phosphor tracking-[0.3em]">
                        {t.start_date ? formatDateShort(t.start_date) : ""}
                        {t.end_date ? ` — ${formatDateShort(t.end_date)}` : t.start_date ? " — Present" : ""}
                      </span>
                      <span className="h-px flex-1 bg-border/60" />
                      <IconComp className="size-4 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg text-foreground font-medium mb-0.5">{t.title}</h3>
                    {t.organization && (
                      <p className="text-sm text-phosphor/80 font-mono mb-1">{t.organization}</p>
                    )}
                    {t.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed max-w-[60ch]">
                        {t.description}
                      </p>
                    )}
                    {t.tags && t.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {t.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider bg-secondary text-muted-foreground rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.li>
                );
              })
            )}
          </ol>
        </div>
      </div>
    </section>
  );
}
