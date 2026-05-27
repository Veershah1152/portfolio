"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [lines, setLines] = useState<string[]>([]);

  const bootLines = [
    "BIOS v2.4.1 — Initializing...",
    "Loading kernel modules...",
    "Mounting portfolio filesystem...",
    "Starting network services...",
    "Loading profile data...",
    "Configuring display...",
    "Boot sequence complete.",
  ];

  useEffect(() => {
    // Don't show loading screen if already visited this session
    if (sessionStorage.getItem("portfolio_loaded")) {
      setVisible(false);
      return;
    }

    let lineIdx = 0;
    const lineInterval = setInterval(() => {
      if (lineIdx < bootLines.length) {
        setLines((prev) => [...prev, bootLines[lineIdx]]);
        setProgress(Math.round(((lineIdx + 1) / bootLines.length) * 100));
        lineIdx++;
      } else {
        clearInterval(lineInterval);
        setTimeout(() => {
          setVisible(false);
          sessionStorage.setItem("portfolio_loaded", "true");
        }, 400);
      }
    }, 180);

    return () => clearInterval(lineInterval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[200] bg-void flex flex-col items-center justify-center"
        >
          <div className="w-full max-w-lg px-8 space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <span className="size-3 rounded-full bg-phosphor animate-pulse-glow" />
              <span className="font-mono text-sm tracking-[0.3em] text-phosphor text-glow uppercase">
                Portfolio OS v1.0
              </span>
            </div>

            {/* Boot lines */}
            <div className="space-y-1 font-mono text-xs text-muted-foreground h-40 overflow-hidden">
              {lines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-phosphor">{">"}</span>
                  <span className={i === lines.length - 1 ? "text-foreground" : ""}>
                    {line}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-[10px] text-muted-foreground tracking-wider">
                <span>LOADING</span>
                <span>{progress}%</span>
              </div>
              <div className="h-[2px] bg-border/60 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-phosphor shadow-phosphor rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          {/* Grid background */}
          <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
          <div className="absolute inset-0 scanlines opacity-[0.06] pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
