"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    return scrollYProgress.on("change", (v) => setScrolled(v > 0.01));
  }, [scrollYProgress]);

  if (!scrolled) return null;

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[2px] bg-phosphor shadow-phosphor z-[100] origin-left"
    />
  );
}
