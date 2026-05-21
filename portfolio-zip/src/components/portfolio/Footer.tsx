export function Footer() {
  return (
    <footer className="py-10 border-t border-border/60 bg-background px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <span className="text-[10px] font-mono text-muted-foreground tracking-widest">
            © {new Date().getFullYear()} AARAV_SHARMA
          </span>
          <div className="flex gap-4">
            {["GitHub", "LinkedIn", "Twitter"].map((l) => (
              <a
                key={l}
                href="#"
                className="text-[10px] font-mono text-muted-foreground hover:text-phosphor transition-colors uppercase tracking-wider"
              >
                {l}
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-2 bg-card/40 rounded-full ring-1 ring-border/60">
          <span className="size-1.5 rounded-full bg-phosphor animate-pulse" />
          <span className="text-[10px] font-mono text-muted-foreground tracking-wider">
            NEW_DELHI_IN // BUILD 0x01.A · UPTIME 247d
          </span>
        </div>
      </div>
    </footer>
  );
}
