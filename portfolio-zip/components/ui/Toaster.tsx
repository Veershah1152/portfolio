"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      toastOptions={{
        style: {
          background: "oklch(0.19 0.006 270)",
          border: "1px solid oklch(0.27 0.006 270)",
          color: "oklch(0.88 0.005 270)",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "13px",
        },
        classNames: {
          success: "!border-phosphor/40",
          error: "!border-destructive/40",
        },
      }}
      position="bottom-right"
    />
  );
}
