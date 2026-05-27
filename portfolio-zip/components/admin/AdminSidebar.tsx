"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  LayoutDashboard, Code2, Zap, Clock, BookOpen,
  User, MessageSquare, Link2, LogOut, Menu, X, Home
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/profile", label: "Profile", icon: User },
  { href: "/admin/projects", label: "Projects", icon: Code2 },
  { href: "/admin/skills", label: "Skills", icon: Zap },
  { href: "/admin/timeline", label: "Timeline", icon: Clock },
  { href: "/admin/blog", label: "Blog", icon: BookOpen },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/linkedin", label: "LinkedIn Import", icon: Link2 },
];

export function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Logged out");
    router.push("/login");
    router.refresh();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-border/60">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-phosphor shadow-phosphor animate-pulse" />
          <span className="font-mono text-xs tracking-[0.2em] text-phosphor uppercase">
            Control Panel
          </span>
        </div>
        <p className="mt-1 text-[10px] font-mono text-muted-foreground truncate">{userEmail}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all font-mono text-sm",
              isActive(item.href, item.exact)
                ? "bg-phosphor/10 text-phosphor ring-1 ring-phosphor/30"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            <item.icon className="size-4 shrink-0" />
            <span className="text-[12px] tracking-wider uppercase">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border/60 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:text-phosphor transition-colors font-mono text-[12px] tracking-wider uppercase"
        >
          <Home className="size-4" />
          View Site
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:text-destructive transition-colors font-mono text-[12px] tracking-wider uppercase"
          id="admin-logout-btn"
        >
          <LogOut className="size-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-panel border-r border-border/60 flex-col z-30">
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-panel border-b border-border/60 px-4 h-12 flex items-center justify-between">
        <span className="font-mono text-xs tracking-[0.2em] text-phosphor uppercase">Control Panel</span>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="size-8 grid place-items-center rounded text-muted-foreground"
          aria-label="Toggle sidebar"
        >
          {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-void/80 z-30 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-panel border-r border-border/60 z-40 md:hidden flex flex-col"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
