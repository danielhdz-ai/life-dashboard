"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";

import { cn } from "@/lib/utils";

type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
  elevation?: "default" | "raised";
  spotlight?: boolean;
  as?: "div" | "article" | "section";
};

export function GlassCard({
  children,
  className,
  elevation = "default",
  spotlight = true,
  as = "div",
}: GlassCardProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState({ x: 50, y: 50, opacity: 0 });

  return (
    <motion.div
      ref={ref}
      role={as === "div" ? undefined : undefined}
      data-as={as}
      className={cn(
        "relative overflow-hidden rounded-[var(--ld-radius-lg)] border border-[var(--ld-border-subtle)] bg-[var(--ld-bg-glass)] backdrop-blur-xl",
        elevation === "raised" ? "shadow-[var(--ld-shadow-elevated)]" : "shadow-[var(--ld-shadow-glass)]",
        className,
      )}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      whileHover={
        reduceMotion
          ? undefined
          : { y: -4, transition: { type: "spring", stiffness: 400, damping: 28 } }
      }
      onMouseMove={
        spotlight
          ? (e: React.MouseEvent) => {
              const el = ref.current;
              if (!el) return;
              const rect = el.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              setSpot({ x, y, opacity: 1 });
            }
          : undefined
      }
      onMouseLeave={spotlight ? () => setSpot((s) => ({ ...s, opacity: 0 })) : undefined}
    >
      {spotlight && (
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: spot.opacity,
            background: `radial-gradient(600px circle at ${spot.x}% ${spot.y}%, var(--ld-accent-glow), transparent 45%)`,
          }}
        />
      )}
      <div className="relative z-[1]">{children}</div>
    </motion.div>
  );
}
