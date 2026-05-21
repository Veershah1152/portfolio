import { GraduationCap, ShieldCheck, Smartphone, Brain } from "lucide-react";

const timeline = [
  {
    year: "2024",
    Icon: GraduationCap,
    title: "Enrolled — B.Tech CSE",
    body: "Began first year at Delhi Technological University. Joined the campus CTF club and started weekly Linux deep-dives.",
  },
  {
    year: "2024",
    Icon: ShieldCheck,
    title: "TryHackMe — Top 3%",
    body: "Completed Pre-Security and Cyber Defence paths. First taste of binary exploitation and Active Directory pivoting.",
  },
  {
    year: "2025",
    Icon: Smartphone,
    title: "Shipped first Android app",
    body: "Released a Kotlin music player with offline caching to the Play Store internal track. 480 weekly active users.",
  },
  {
    year: "2025",
    Icon: Brain,
    title: "AI Resume Parser v1.0",
    body: "Built an LLM-backed ATS analyzer for student CVs. Currently used by 200+ peers in placement prep.",
  },
];

export function About() {
  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeader index="00" label="Operator Profile" title="The dossier so far" />

        <div className="grid lg:grid-cols-12 gap-12 mt-12">
          <div className="lg:col-span-4 space-y-6">
            <p className="text-foreground/90 leading-relaxed">
              I treat code like critical infrastructure — opinionated about
              boundaries, defensive about state, allergic to magic. My focus
              cycles between three pursuits: hardening Android runtimes,
              decomposing exploits at the TCP layer, and prodding language
              models until they confess.
            </p>
            <p className="text-muted-foreground leading-relaxed text-sm">
              I write because explaining a vulnerability is half of patching
              it. I ship because shipped code teaches more than perfect drafts.
              I'm two semesters in. Talk to me in five years.
            </p>

            <div className="grid grid-cols-3 gap-px bg-border/60 mt-8">
              {[
                ["34", "CTFs"],
                ["12", "Vulns"],
                ["1.2k", "Commits"],
              ].map(([n, l]) => (
                <div key={l} className="bg-background p-4">
                  <div className="font-mono text-2xl text-phosphor text-glow">{n}</div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ol className="lg:col-span-8 relative border-l border-border/80 pl-8 space-y-10">
            {timeline.map((t, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[41px] top-1 size-3 rounded-full bg-phosphor ring-4 ring-background shadow-phosphor" />
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-[10px] text-phosphor tracking-[0.3em]">
                    {t.year}
                  </span>
                  <span className="h-px flex-1 bg-border/60" />
                  <t.Icon className="size-4 text-muted-foreground" />
                </div>
                <h3 className="text-lg text-foreground font-medium mb-1">{t.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[60ch]">
                  {t.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({
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
