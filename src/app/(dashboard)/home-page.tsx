"use client";

import { motion, useReducedMotion } from "framer-motion";

import { BusinessCards } from "@/components/dashboard/business-cards";
import { BusinessLogoStrip } from "@/components/dashboard/business-logo-strip";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { IncomeStackedChart } from "@/components/dashboard/income-chart";
import { PaymentCalendar } from "@/components/dashboard/payment-calendar";
import { SourceDonut } from "@/components/dashboard/source-donut";
import { UpcomingPayments } from "@/components/dashboard/upcoming-payments";
import { GlassCard } from "@/components/glass/glass-card";
import { StatCard } from "@/components/glass/stat-card";
import type { CalendarMonthSummary } from "@/lib/dashboard/calendar-queries";
import type { DashboardSummary } from "@/lib/dashboard/queries";
import { formatCurrency } from "@/lib/format";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

type Props = {
  summary: DashboardSummary | null;
  calendar: CalendarMonthSummary | null;
  missingConfig?: "supabase";
  todayLabel: string;
  greetingHour: number;
};

export function HomePage({
  summary,
  calendar,
  missingConfig,
  todayLabel,
  greetingHour,
}: Props) {
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
      className="mx-auto max-w-[1600px] space-y-10"
    >
      <motion.header variants={item} className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-[var(--ld-text-muted)] capitalize">{todayLabel || "…"}</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {greeting}, Daniel
          </h1>
          {missingConfig === "supabase" && (
            <p className="text-sm text-[var(--ld-warning)]">
              Configura Supabase y ejecuta `scripts/all-migrations.sql`.
            </p>
          )}
        </div>
        <GlassCard className="px-4 py-3" spotlight={false}>
          <BusinessLogoStrip />
        </GlassCard>
      </motion.header>

      {/* Hero: calendario principal */}
      <motion.div variants={item} className="grid gap-4 xl:grid-cols-[1fr_320px]">
        {calendar ? (
          <PaymentCalendar initial={calendar} />
        ) : (
          <GlassCard className="flex min-h-[420px] items-center justify-center p-8">
            <p className="text-sm text-[var(--ld-text-muted)]">
              Calendario disponible tras conectar Supabase.
            </p>
          </GlassCard>
        )}
        <div className="flex flex-col gap-4">
          {calendar && <UpcomingPayments payments={calendar.payments} />}
          <GlassCard className="p-5" spotlight={false}>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--ld-text-faint)]">
              Mes en curso
            </p>
            <p className="ld-sensitive mt-2 text-2xl font-semibold tabular-nums">
              {formatCurrency(calendar?.totalIncome ?? summary?.grossIncome ?? 0)}
            </p>
            <p className="mt-1 text-xs text-[var(--ld-text-muted)]">
              Beneficio neto estimado{" "}
              <span className="ld-sensitive font-medium text-[var(--ld-text-primary)]">
                {formatCurrency(net)}
              </span>
            </p>
          </GlassCard>
        </div>
      </motion.div>

      <DashboardSection title="Rendimiento" subtitle="KPIs clave del mes">
        <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Beneficio neto"
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
                : "Próx. en Ajustes"
            }
          />
        </motion.div>
      </DashboardSection>

      <DashboardSection title="Análisis" subtitle="Tendencia y reparto por negocio">
        <motion.div variants={item} className="grid gap-4 lg:grid-cols-3">
          <GlassCard className="lg:col-span-2 p-6" elevation="raised">
            <h3 className="text-base font-medium">Ingresos · 12 meses</h3>
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
            <h3 className="text-base font-medium">Reparto del mes</h3>
            <div className="mt-4">{summary ? <SourceDonut data={summary.sourceBreakdown} /> : null}</div>
          </GlassCard>
        </motion.div>
      </DashboardSection>

      {summary && (
        <DashboardSection title="Negocios" subtitle="Margen y evolución por fuente">
          <motion.div variants={item}>
            <BusinessCards businesses={summary.businesses} />
          </motion.div>
        </DashboardSection>
      )}
    </motion.div>
  );
}

function getGreeting(hour: number) {
  if (hour < 12) return "Buenos días";
  if (hour < 20) return "Buenas tardes";
  return "Buenas noches";
}
