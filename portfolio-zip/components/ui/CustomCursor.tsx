"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function CustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show custom cursor on desktop
    if (window.matchMedia("(pointer: coarse)").matches) return;

    setIsVisible(true);

    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };

    const onDown = () => setIsClicking(true);
    const onUp = () => setIsClicking(false);

    const onEnter = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (
        el.tagName === "A" ||
        el.tagName === "BUTTON" ||
        el.closest("a") ||
        el.closest("button") ||
        el.getAttribute("role") === "button" ||
        el.classList.contains("cursor-pointer")
      ) {
        setIsHovering(true);
      }
    };

    const onLeave = () => setIsHovering(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseover", onEnter);
    document.addEventListener("mouseout", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseover", onEnter);
      document.removeEventListener("mouseout", onLeave);
    };
  }, []);

  // Smooth trail
  useEffect(() => {
    let raf: number;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      setTrail((prev) => ({
        x: lerp(prev.x, pos.x, 0.12),
        y: lerp(prev.y, pos.y, 0.12),
      }));
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [pos]);

  if (!isVisible) return null;

  return (
    <>
      {/* Main dot cursor */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[999] mix-blend-screen"
        animate={{
          x: pos.x - 4,
          y: pos.y - 4,
          scale: isClicking ? 0.6 : 1,
        }}
        transition={{ type: "spring", stiffness: 1000, damping: 50, mass: 0.1 }}
      >
        <div
          className={`size-2 rounded-full transition-all duration-150 ${
            isHovering
              ? "bg-phosphor shadow-phosphor scale-150"
              : "bg-phosphor"
          }`}
        />
      </motion.div>

      {/* Trailing ring */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[998] mix-blend-screen"
        style={{
          transform: `translate(${trail.x - 16}px, ${trail.y - 16}px)`,
        }}
      >
        <div
          className={`rounded-full border transition-all duration-300 ${
            isHovering
              ? "size-12 border-phosphor/60 scale-110"
              : "size-8 border-phosphor/30"
          }`}
        />
      </div>
    </>
  );
}
