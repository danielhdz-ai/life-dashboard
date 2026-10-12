"use client";

import { motion, useReducedMotion } from "framer-motion";

import { BusinessCards } from "@/components/dashboard/business-cards";
import { IncomeStackedChart } from "@/components/dashboard/income-chart";
import { SourceDonut } from "@/components/dashboard/source-donut";
import { CalendarGrid } from "@/components/glass/calendar-grid";
import { GlassCard } from "@/components/glass/glass-card";
import { StatCard } from "@/components/glass/stat-card";
import type { DashboardSummary } from "@/lib/dashboard/queries";
import { formatCurrency } from "@/lib/format";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

type Props = {
  summary: DashboardSummary | null;
  missingConfig?: "supabase";
  todayLabel: string;
  greetingHour: number;
};

export function HomePage({ summary, missingConfig, todayLabel, greetingHour }: Props) {
  const reduceMotion = useReducedMotion();
  const greeting = getGreeting(greetingHour);

  const net = summary?.netProfit ?? 0;
  const prev = summary?.prevMonthNet ?? 0;
  const deltaPct = prev !== 0 ? ((net - prev) / Math.abs(prev)) * 100 : null;

  const sourceKeys =
    summary?.businesses.map((b) => ({
      slug: b.slug,
      color: b.color,
      name: b.name,
    })) ?? [];

  return (
    <motion.div
      variants={reduceMotion ? undefined : stagger}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-7xl space-y-8"
    >
      <motion.header variants={item} className="space-y-1">
        <p className="text-sm text-[var(--ld-text-muted)] capitalize">
          {todayLabel || "…"}
          {summary?.monthLabel ? ` · ${summary.monthLabel}` : ""}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {greeting}, Daniel
        </h1>
        {missingConfig === "supabase" && (
          <p className="text-sm text-[var(--ld-warning)]">
            Configura `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en
            `.env.local` y aplica migraciones con `supabase db push`.
          </p>
        )}
      </motion.header>

      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Beneficio neto (mes)"
          value={formatCurrency(net)}
          hint="Ingresos netos − gastos"
          trend={
            deltaPct != null
              ? {
                  value: `${deltaPct >= 0 ? "+" : ""}${deltaPct.toFixed(1)} %`,
                  positive: deltaPct >= 0,
                }
              : undefined
          }
        />
        <StatCard
          label="Ingresos brutos"
          value={formatCurrency(summary?.grossIncome ?? 0)}
          hint="Mes en curso"
        />
        <StatCard
          label="Cobrado / pendiente"
          value={`${formatCurrency(summary?.collected ?? 0)} / ${formatCurrency(summary?.pending ?? 0)}`}
        />
        <StatCard
          label="Objetivo mensual"
          value={
            summary?.goalTarget
              ? `${summary.goalProgress.toFixed(0)} %`
              : "Sin objetivo"
          }
          hint={
            summary?.goalTarget
              ? `Meta ${formatCurrency(summary.goalTarget)}`
              : "Configura en Ajustes (próx.)"
          }
        />
      </motion.div>

      <motion.div variants={item} className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2 p-6" elevation="raised">
          <h2 className="text-lg font-medium">Ingresos por mes</h2>
          <p className="mt-1 text-sm text-[var(--ld-text-muted)]">
            Últimos 12 meses por negocio (neto)
          </p>
          <div className="mt-4">
            {summary ? (
              <IncomeStackedChart data={summary.monthlyChart} sourceKeys={sourceKeys} />
            ) : (
              <div className="flex h-52 items-center justify-center text-sm text-[var(--ld-text-faint)]">
                Sin datos
              </div>
            )}
          </div>
        </GlassCard>
        <GlassCard className="p-6">
          <h2 className="text-lg font-medium">Reparto del mes</h2>
          <div className="mt-4">
            {summary ? <SourceDonut data={summary.sourceBreakdown} /> : null}
          </div>
        </GlassCard>
      </motion.div>

      {summary && (
        <motion.div variants={item}>
          <h2 className="mb-3 text-lg font-medium">Negocios</h2>
          <BusinessCards businesses={summary.businesses} />
        </motion.div>
      )}

      <motion.div variants={item}>
        <CalendarGrid />
      </motion.div>
    </motion.div>
  );
}

function getGreeting(hour: number) {
  if (hour < 12) return "Buenos días";
  if (hour < 20) return "Buenas tardes";
  return "Buenas noches";
}
