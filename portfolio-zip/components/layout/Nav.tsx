"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, Terminal, Command } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";

const navLinks = [
  { label: "Dossier", href: "#about" },
  { label: "Stack", href: "#skills" },
  { label: "Deployments", href: "#projects" },
  { label: "Timeline", href: "#experience" },
  { label: "Blog", href: "/blog" },
  { label: "Uplink", href: "#contact" },
];

function useActiveSection() {
  const [active, setActive] = useState("");

  useEffect(() => {
    const sections = ["about", "skills", "projects", "experience", "contact"];
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });

    return () => obs.disconnect();
  }, []);

  return active;
}

export function Nav({ siteTitle }: { siteTitle?: string }) {
  const [clock, setClock] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const active = useActiveSection();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(
        d.toLocaleTimeString("en-GB", { hour12: false, timeZone: "UTC" }) + " UTC"
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleAnchorClick = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("#")) {
      if (pathname !== "/") {
        router.push("/" + href);
      } else {
        const el = document.getElementById(href.slice(1));
        el?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={cn(
          "fixed top-0 inset-x-0 z-40 border-b transition-all duration-300",
          scrolled
            ? "border-border/60 bg-void/90 backdrop-blur-md"
            : "border-transparent bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 group"
          >
            <span className="size-2 rounded-full bg-phosphor animate-pulse shadow-phosphor" />
            <span className="font-mono text-xs tracking-[0.2em] text-foreground/90 group-hover:text-phosphor transition-colors uppercase">
              {siteTitle || "PORTFOLIO_V2"}
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map((l) => {
              const id = l.href.startsWith("#") ? l.href.slice(1) : null;
              const isActive = id ? active === id : false;

              if (l.href.startsWith("#")) {
                return (
                  <button
                    key={l.href}
                    onClick={() => handleAnchorClick(l.href)}
                    className={cn(
                      "px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.18em] transition-colors rounded",
                      isActive
                        ? "text-phosphor"
                        : "text-muted-foreground hover:text-phosphor/80"
                    )}
                  >
                    {l.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-indicator"
                        className="absolute -bottom-px left-0 right-0 h-px bg-phosphor"
                      />
                    )}
                  </button>
                );
              }
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground hover:text-phosphor/80 transition-colors rounded"
                >
                  {l.label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* ⌘K hint */}
            <button
              onClick={() => {
                const ev = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true });
                window.dispatchEvent(ev);
              }}
              className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-secondary/50 border border-border/60 hover:border-phosphor/30 transition-colors"
              aria-label="Open command palette"
            >
              <Command className="size-3 text-muted-foreground" />
              <span className="font-mono text-[10px] text-muted-foreground tracking-wider">K</span>
            </button>

            {/* Clock */}
            <div className="hidden lg:flex items-center gap-2 font-mono text-[10px] tracking-wider text-muted-foreground">
              <span className="size-1.5 rounded-full bg-phosphor animate-pulse" />
              <span>{clock}</span>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden size-9 grid place-items-center rounded border border-border/60 text-muted-foreground hover:text-phosphor hover:border-phosphor/40 transition-colors"
              aria-label="Toggle menu"
              id="mobile-menu-toggle"
            >
              {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-void/80 backdrop-blur-sm z-30 md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-64 z-30 md:hidden bg-panel border-l border-border/60 flex flex-col"
            >
              <div className="flex items-center justify-between px-5 h-14 border-b border-border/60">
                <span className="font-mono text-xs text-phosphor tracking-[0.2em]">MENU</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="size-8 grid place-items-center rounded hover:bg-secondary/50 transition-colors"
                >
                  <X className="size-4 text-muted-foreground" />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-1">
                {navLinks.map((l) => (
                  l.href.startsWith("#") ? (
                    <button
                      key={l.href}
                      onClick={() => handleAnchorClick(l.href)}
                      className="w-full text-left px-3 py-2.5 font-mono text-sm text-muted-foreground hover:text-phosphor hover:bg-secondary/40 rounded transition-colors uppercase tracking-widest"
                    >
                      {l.label}
                    </button>
                  ) : (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2.5 font-mono text-sm text-muted-foreground hover:text-phosphor hover:bg-secondary/40 rounded transition-colors uppercase tracking-widest"
                    >
                      {l.label}
                    </Link>
                  )
                ))}
              </nav>
              <div className="p-5 border-t border-border/60">
                <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground tracking-wider">
                  <span className="size-1.5 rounded-full bg-phosphor animate-pulse" />
                  <span>{clock}</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
