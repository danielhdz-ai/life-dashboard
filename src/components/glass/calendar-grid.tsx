"use client";

import { GlassCard } from "@/components/glass/glass-card";

/** Placeholder del calendario mensual (Fase 2). */
export function CalendarGrid() {
  return (
    <GlassCard className="flex min-h-[280px] items-center justify-center p-8" spotlight={false}>
      <div className="text-center">
        <p className="text-sm font-medium">Calendario de pagos</p>
        <p className="mt-1 max-w-sm text-sm text-[var(--ld-text-muted)]">
          Vista mensual con cobros, vencimientos y pipeline — disponible en la Fase 2.
        </p>
      </div>
    </GlassCard>
  );
}
