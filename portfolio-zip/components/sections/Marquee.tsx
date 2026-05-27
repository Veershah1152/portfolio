import type { Profile } from "@/lib/supabase/types";

interface MarqueeProps {
  items?: string[];
}

export function Marquee({ items }: MarqueeProps) {
  const defaults = [
    "TYPESCRIPT", "REACT", "NEXT_JS", "SUPABASE", "TAILWINDCSS", "FRAMER_MOTION",
    "POSTGRESQL", "DOCKER", "PYTHON", "NODE_JS", "VERCEL", "CLOUDFLARE",
  ];
  const marqueeItems = items && items.length > 0 ? items : defaults;
  const doubled = [...marqueeItems, ...marqueeItems];

  return (
    <div className="border-y border-border/60 overflow-hidden bg-card/30">
      <div className="flex animate-marquee whitespace-nowrap py-3">
        {doubled.map((t, i) => (
          <span
            key={i}
            className="px-8 font-mono text-[11px] tracking-[0.3em] text-muted-foreground"
          >
            <span className="text-phosphor/60">{"//"}</span> {t}
          </span>
        ))}
      </div>
    </div>
  );
}
