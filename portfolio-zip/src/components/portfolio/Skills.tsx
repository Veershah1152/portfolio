import { SectionHeader } from "./About";

const groups = [
  {
    cat: "Languages",
    items: [
      { n: "Kotlin", v: 85 },
      { n: "Python", v: 80 },
      { n: "TypeScript", v: 72 },
      { n: "C / C++", v: 65 },
      { n: "Bash", v: 70 },
    ],
  },
  {
    cat: "Cybersecurity",
    items: [
      { n: "Network Recon", v: 82 },
      { n: "Web Exploit", v: 74 },
      { n: "Linux Hardening", v: 78 },
      { n: "Reverse Eng.", v: 55, learning: true },
    ],
  },
  {
    cat: "Android",
    items: [
      { n: "Jetpack Compose", v: 80 },
      { n: "Coroutines / Flow", v: 76 },
      { n: "Room / SQLDelight", v: 70 },
      { n: "Frida / Magisk", v: 60, learning: true },
    ],
  },
  {
    cat: "AI / ML",
    items: [
      { n: "PyTorch", v: 62 },
      { n: "TF Lite", v: 68 },
      { n: "LLM Tooling", v: 75 },
      { n: "Vector DBs", v: 55, learning: true },
    ],
  },
];

export function Skills() {
  return (
    <section id="skills" className="py-24 px-6 bg-card/20">
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

        <div className="grid md:grid-cols-2 gap-px bg-border/60 mt-12">
          {groups.map((g) => (
            <div key={g.cat} className="bg-background p-8">
              <div className="flex items-baseline justify-between mb-6">
                <h3 className="font-mono text-[11px] tracking-[0.3em] uppercase text-phosphor">
                  // {g.cat}
                </h3>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {g.items.length} nodes
                </span>
              </div>
              <ul className="space-y-5">
                {g.items.map((s) => (
                  <li key={s.n} className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="flex items-center gap-2 text-foreground">
                        {s.n}
                        {s.learning && (
                          <span className="px-1.5 py-0.5 text-[9px] tracking-widest uppercase bg-amber-flare/10 text-amber-flare ring-1 ring-amber-flare/30 rounded">
                            Learning
                          </span>
                        )}
                      </span>
                      <span className="text-muted-foreground">{s.v}%</span>
                    </div>
                    <div className="h-[2px] bg-border/60 relative overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-phosphor shadow-phosphor"
                        style={{ width: `${s.v}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
