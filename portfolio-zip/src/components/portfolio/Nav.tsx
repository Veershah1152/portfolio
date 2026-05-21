import { useEffect, useState } from "react";

const links = [
  { label: "Dossier", href: "#about" },
  { label: "Stack", href: "#skills" },
  { label: "Deployments", href: "#projects" },
  { label: "Terminal", href: "#terminal" },
  { label: "Uplink", href: "#contact" },
];

export function Nav() {
  const [clock, setClock] = useState("");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(
        d.toLocaleTimeString("en-GB", { hour12: false, timeZone: "UTC" }) +
          " UTC",
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <nav className="fixed top-0 inset-x-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 group">
          <span className="size-2 rounded-full bg-phosphor animate-pulse shadow-phosphor" />
          <span className="font-mono text-xs tracking-[0.2em] text-foreground/90 group-hover:text-phosphor transition-colors">
            SHARMA_SEC_V1.0
          </span>
        </a>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground hover:text-phosphor transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-3 font-mono text-[10px] tracking-wider text-muted-foreground">
          <span className="size-1.5 rounded-full bg-phosphor" />
          <span>{clock}</span>
        </div>
      </div>
    </nav>
  );
}
