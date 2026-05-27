"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { Skill, SkillGroup } from "@/lib/supabase/types";
import { SectionHeader } from "./About";

interface SkillsProps {
  groups: SkillGroup[];
}

function SkillBar({ skill, delay }: { skill: Skill; delay: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <li ref={ref} className="space-y-2">
      <div className="flex justify-between items-center text-xs font-mono">
        <span className="flex items-center gap-2 text-foreground">
          {skill.name}
          {skill.is_learning && (
            <span className="px-1.5 py-0.5 text-[9px] tracking-widest uppercase bg-amber-flare/10 text-amber-flare ring-1 ring-amber-flare/30 rounded">
              Learning
            </span>
          )}
        </span>
        <span className="text-muted-foreground">{skill.percentage}%</span>
      </div>
      <div className="h-[2px] bg-border/60 relative overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-phosphor shadow-phosphor"
          initial={{ width: 0 }}
          animate={inView ? { width: `${skill.percentage}%` } : { width: 0 }}
          transition={{ duration: 0.8, delay, ease: "easeOut" }}
        />
      </div>
    </li>
  );
}

export function Skills({ groups }: SkillsProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  if (!groups || groups.length === 0) {
    return null;
  }

  return (
    <section id="skills" ref={ref} className="py-24 px-6 bg-card/20">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          index="01"
          label="Stack Telemetry"
          title="Calibrated capability map"
          right={
            <span className="hidden md:block font-mono text-[10px] text-muted-foreground tracking-wider">
              SAMPLED: {new Date().toISOString().slice(0, 10)}
            </span>
          }
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="grid md:grid-cols-2 gap-px bg-border/60 mt-12"
        >
          {groups.map((g) => (
            <div key={g.category} className="bg-background p-8">
              <div className="flex items-baseline justify-between mb-6">
                <h3 className="font-mono text-[11px] tracking-[0.3em] uppercase text-phosphor">
                  // {g.category}
                </h3>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {g.items.length} nodes
                </span>
              </div>
              <ul className="space-y-5">
                {g.items.map((skill, i) => (
                  <SkillBar key={skill.id} skill={skill} delay={i * 0.08} />
                ))}
              </ul>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
