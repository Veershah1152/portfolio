import Link from "next/link";
import { GitBranch, Link as LinkIcon, AtSign, Mail } from "lucide-react";
import type { Profile } from "@/lib/supabase/types";

interface FooterProps {
  profile?: Profile | null;
}

export function Footer({ profile }: FooterProps) {
  const socials = [
    { label: "GitHub", href: profile?.github_url || "#", Icon: GitBranch },
    { label: "LinkedIn", href: profile?.linkedin_url || "#", Icon: LinkIcon },
    { label: "Twitter", href: profile?.twitter_url || "#", Icon: AtSign },
    { label: "Email", href: profile?.email ? `mailto:${profile.email}` : "#", Icon: Mail },
  ].filter((s) => s.href && s.href !== "#");

  return (
    <footer className="py-10 border-t border-border/60 bg-void px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6 flex-wrap">
          <span className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
            © {new Date().getFullYear()} {profile?.name?.toUpperCase() || "PORTFOLIO"}
          </span>
          <div className="flex gap-4">
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                aria-label={label}
                className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground hover:text-phosphor transition-colors uppercase tracking-wider group"
              >
                <Icon className="size-3" />
                {label}
              </a>
            ))}
          </div>
          <Link
            href="/blog"
            className="text-[10px] font-mono text-muted-foreground hover:text-phosphor transition-colors uppercase tracking-wider"
          >
            Blog
          </Link>
        </div>

        <div className="flex items-center gap-3 px-4 py-2 bg-panel/40 rounded-full ring-1 ring-border/60">
          <span className="size-1.5 rounded-full bg-phosphor animate-pulse" />
          <span className="text-[10px] font-mono text-muted-foreground tracking-wider">
            {profile?.location || "EARTH"} · BUILD 0x02.A
          </span>
        </div>
      </div>
    </footer>
  );
}
