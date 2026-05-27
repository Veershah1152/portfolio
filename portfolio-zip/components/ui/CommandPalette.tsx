"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Code2, User, Briefcase, BookOpen, Mail, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const commands = [
  { id: "home", label: "Go to Home", icon: User, shortcut: "H", href: "/" },
  { id: "about", label: "About Me", icon: User, shortcut: null, href: "/#about" },
  { id: "projects", label: "View Projects", icon: Code2, shortcut: null, href: "/#projects" },
  { id: "skills", label: "My Skills", icon: Briefcase, shortcut: null, href: "/#skills" },
  { id: "blog", label: "Blog Posts", icon: BookOpen, shortcut: null, href: "/blog" },
  { id: "contact", label: "Contact Me", icon: Mail, shortcut: null, href: "/#contact" },
  { id: "admin", label: "Admin Dashboard", icon: Settings, shortcut: null, href: "/admin" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      if (href.startsWith("/#")) {
        const id = href.slice(2);
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        } else {
          router.push(href);
        }
      } else {
        router.push(href);
      }
    },
    [router]
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-void/80 backdrop-blur-sm z-[150]"
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-[151] glass-card rounded-xl overflow-hidden shadow-phosphor-soft"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                aria-label="Command palette search"
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 bg-secondary text-[10px] font-mono text-muted-foreground rounded border border-border/60">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="p-2 max-h-72 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground font-mono">
                  No commands found.
                </p>
              ) : (
                filtered.map((cmd) => (
                  <button
                    key={cmd.id}
                    onClick={() => handleSelect(cmd.href)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left",
                      "text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                      "transition-all group font-mono"
                    )}
                  >
                    <cmd.icon className="size-4 text-phosphor shrink-0" />
                    <span className="flex-1 text-[13px]">{cmd.label}</span>
                    <ArrowRight className="size-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-border/60 flex items-center gap-4 font-mono text-[10px] text-muted-foreground/70 tracking-wider">
              <span>⌘K to toggle</span>
              <span>↑↓ navigate</span>
              <span>↵ select</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
