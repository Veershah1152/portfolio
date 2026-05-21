import { useEffect, useState } from "react";
import { ArrowUpRight, Download, Github, Linkedin, Mail, Twitter } from "lucide-react";

const roles = [
  "/usr/bin/security-specialist",
  "/usr/bin/android-engineer",
  "/usr/bin/ai-explorer",
  "/usr/bin/cse-undergrad",
];

export function Hero() {
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
  }, [idx]);

  return (
    <section
      id="top"
      className="relative pt-32 pb-28 overflow-hidden border-b border-border/60"
    >
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[420px] bg-phosphor/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 scanlines opacity-[0.08] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* LEFT */}
          <div className="lg:col-span-7 flex flex-col items-start gap-8">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-card/60 ring-1 ring-border rounded-md">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-phosphor opacity-60 animate-ping" />
                <span className="relative inline-flex size-2 rounded-full bg-phosphor" />
              </span>
              <span className="text-[10px] font-mono tracking-[0.22em] text-muted-foreground uppercase">
                System Status: Operational
              </span>
            </div>

            <div className="space-y-5">
              <h1 className="text-5xl md:text-7xl font-medium text-foreground tracking-tight leading-[0.95] text-balance">
                Aarav Sharma
              </h1>
              <div className="h-10 flex items-center">
                <span className="font-mono text-phosphor text-lg md:text-2xl text-glow">
                  $ {typed}
                  <span className="inline-block w-2 h-5 ml-1 bg-phosphor align-middle animate-blink" />
                </span>
              </div>
              <p className="text-base md:text-lg text-muted-foreground text-pretty max-w-[58ch] leading-relaxed">
                First-year Computer Science undergraduate engineering secure
                Android environments and AI-driven threat detection. Building
                defensive architecture through kernel-level exploration,
                shipping production Kotlin, and decomposing CTFs at 3 a.m.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="#projects"
                className="group inline-flex items-center gap-2 bg-phosphor text-primary-foreground px-4 py-2.5 text-sm font-semibold rounded ring-1 ring-phosphor hover:shadow-phosphor active:scale-[0.98] transition-all"
              >
                View Dossier
                <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 py-2.5 px-4 bg-card text-foreground text-sm font-medium ring-1 ring-border hover:ring-phosphor/40 transition-colors rounded"
              >
                <Mail className="size-4" />
                Open Uplink
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 py-2.5 px-4 bg-card text-foreground text-sm font-medium ring-1 ring-border hover:ring-phosphor/40 transition-colors rounded"
              >
                <Download className="size-4" />
                CV.pdf
              </a>
            </div>

            <div className="flex items-center gap-1 pt-2">
              {[
                { Icon: Github, href: "#", label: "GitHub" },
                { Icon: Linkedin, href: "#", label: "LinkedIn" },
                { Icon: Twitter, href: "#", label: "Twitter" },
                { Icon: Mail, href: "#contact", label: "Email" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="size-9 grid place-items-center rounded ring-1 ring-border/60 text-muted-foreground hover:text-phosphor hover:ring-phosphor/40 transition-colors"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* RIGHT — Live terminal */}
          <div className="lg:col-span-5 w-full">
            <HeroTerminal />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroTerminal() {
  const lines = [
    { p: "$", t: "whoami", k: "in" },
    { t: "aarav — first-year CSE @ DTU", k: "out" },
    { p: "$", t: "cat ./focus.txt", k: "in" },
    { t: "cybersecurity · android · ai · systems", k: "out" },
    { p: "$", t: "uptime", k: "in" },
    { t: "247 days streak · 1,284 commits · 34 CTFs", k: "out" },
    { p: "$", t: "nmap -sV recruiters.io", k: "in" },
    { t: "PORT 443/tcp open  hire/https  status=READY", k: "phos" },
  ];

  return (
    <div className="relative bg-card/80 ring-1 ring-border rounded-lg overflow-hidden shadow-phosphor-soft animate-flicker">
      <div className="flex items-center justify-between px-3 py-2 bg-secondary/40 border-b border-border">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-muted-foreground/40" />
          <span className="size-2.5 rounded-full bg-muted-foreground/40" />
          <span className="size-2.5 rounded-full bg-muted-foreground/40" />
        </div>
        <span className="text-[10px] font-mono text-muted-foreground tracking-wider">
          root@aarav-sharma:~
        </span>
        <span className="size-4" />
      </div>

      <div className="p-5 font-mono text-[13px] leading-relaxed space-y-1.5 min-h-[320px]">
        {lines.map((l, i) => (
          <div key={i} className="flex gap-3">
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
          </div>
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
  );
}
