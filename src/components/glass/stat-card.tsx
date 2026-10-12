"use client";

import { motion, useReducedMotion } from "framer-motion";

import { GlassCard } from "@/components/glass/glass-card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: React.ReactNode;
  hint?: string;
  trend?: { value: string; positive?: boolean };
  className?: string;
};

export function StatCard({ label, value, hint, trend, className }: StatCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <GlassCard className={cn("p-5", className)} spotlight={false}>
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--ld-text-muted)]">
        {label}
      </p>
      <motion.div
        className="ld-sensitive mt-2 text-3xl font-semibold tabular-nums tracking-tight"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, type: "spring", stiffness: 300, damping: 28 }}
      >
        {value}
      </motion.div>
      {(hint || trend) && (
        <div className="mt-2 flex items-center gap-2 text-xs text-[var(--ld-text-secondary)]">
          {trend && (
            <span
              className={cn(
                "font-medium",
                trend.positive ? "text-[var(--ld-success)]" : "text-[var(--ld-danger)]",
              )}
            >
              {trend.value}
            </span>
          )}
          {hint && <span>{hint}</span>}
        </div>
      )}
    </GlassCard>
  );
}
