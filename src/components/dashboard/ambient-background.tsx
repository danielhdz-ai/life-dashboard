"use client";

import { motion, useReducedMotion } from "framer-motion";

export function AmbientBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[var(--ld-bg-deep)]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#0e0e14] via-[var(--ld-bg-deep)] to-[#08080c]" />
      {!reduceMotion && (
        <>
          <motion.div
            className="absolute -left-[10%] top-[8%] h-[520px] w-[520px] rounded-full bg-[#c8d0ff]/[0.07] blur-[100px]"
            animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
            transition={{ duration: 38, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute right-[-5%] top-[35%] h-[480px] w-[480px] rounded-full bg-white/[0.04] blur-[90px]"
            animate={{ x: [0, -35, 25, 0], y: [0, 25, -15, 0] }}
            transition={{ duration: 44, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-[-10%] left-[30%] h-[560px] w-[560px] rounded-full bg-[#9aa8ff]/[0.05] blur-[110px]"
            animate={{ x: [0, 30, -25, 0], y: [0, -20, 30, 0] }}
            transition={{ duration: 52, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}
      <div className="ld-grain" />
    </div>
  );
}
