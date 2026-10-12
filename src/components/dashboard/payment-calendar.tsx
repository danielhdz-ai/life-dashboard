"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Repeat } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { SourceLogo } from "@/components/dashboard/source-logo";
import { GlassButton } from "@/components/glass/glass-button";
import { GlassCard } from "@/components/glass/glass-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { CalendarMonthSummary, CalendarPayment } from "@/lib/dashboard/calendar-queries";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

type Props = {
  initial: CalendarMonthSummary;
};

export function PaymentCalendar({ initial }: Props) {
  const reduceMotion = useReducedMotion();
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [viewDate, setViewDate] = useState(() => parseISO(`${initial.monthKey}-01`));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const loadMonth = useCallback(async (date: Date) => {
    const key = format(date, "yyyy-MM");
    setLoading(true);
    try {
      const res = await fetch(`/api/calendar?month=${key}`);
      if (res.ok) {
        const json = (await res.json()) as CalendarMonthSummary;
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const goMonth = (delta: number) => {
    const next = delta === 0 ? new Date() : addMonths(viewDate, delta);
    setViewDate(next);
    void loadMonth(next);
    setSelectedDay(null);
  };

  const gridDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(viewDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [viewDate]);

  const byDate = useMemo(() => {
    const map = new Map<string, CalendarPayment[]>();
    for (const p of data.payments) {
      const list = map.get(p.date) ?? [];
      list.push(p);
      map.set(p.date, list);
    }
    return map;
  }, [data.payments]);

  const todayStr = format(new Date(), "yyyy-MM-dd");

  return (
    <GlassCard className="overflow-hidden p-0" elevation="raised" spotlight={false}>
      <div className="border-b border-[var(--ld-border-subtle)] px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--ld-text-faint)]">
              Centro de pagos
            </p>
            <h2 className="text-xl font-semibold capitalize sm:text-2xl">
              {format(viewDate, "MMMM yyyy", { locale: es })}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <GlassButton size="icon" variant="ghost" onClick={() => goMonth(-1)} aria-label="Mes anterior">
              <ChevronLeft className="h-4 w-4" />
            </GlassButton>
            <GlassButton size="sm" variant="ghost" onClick={() => goMonth(0)}>
              Hoy
            </GlassButton>
            <GlassButton size="icon" variant="ghost" onClick={() => goMonth(1)} aria-label="Mes siguiente">
              <ChevronRight className="h-4 w-4" />
            </GlassButton>
          </div>
        </div>
        <div className="ld-sensitive mt-4 flex flex-wrap gap-4 text-sm text-[var(--ld-text-secondary)]">
          <span>
            Ingresos: <strong className="text-[var(--ld-text-primary)]">{formatCurrency(data.totalIncome)}</strong>
          </span>
          <span>
            Cobrado: <strong className="text-[var(--ld-success)]">{formatCurrency(data.collected)}</strong>
          </span>
          <span>
            Pendiente: <strong className="text-[var(--ld-warning)]">{formatCurrency(data.pending)}</strong>
          </span>
          <span>
            Gastos: <strong className="text-[var(--ld-danger)]">{formatCurrency(data.totalExpense)}</strong>
          </span>
        </div>
      </div>

      <div className={cn("relative px-3 pb-4 pt-3 sm:px-4", loading && "opacity-60")}>
        <div className="mb-2 grid grid-cols-7 gap-1">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="py-1 text-center text-[10px] font-medium uppercase tracking-wider text-[var(--ld-text-faint)]"
            >
              {d}
            </div>
          ))}
        </div>

        <motion.div
          className="grid grid-cols-7 gap-1 sm:gap-1.5"
          layout={!reduceMotion}
        >
          {gridDays.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const items = byDate.get(key) ?? [];
            const inMonth = isSameMonth(day, viewDate);
            const isToday = key === todayStr;
            const isSelected = selectedDay === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDay(key === selectedDay ? null : key)}
                className={cn(
                  "min-h-[88px] rounded-[var(--ld-radius-md)] border p-1.5 text-left transition-colors sm:min-h-[104px] sm:p-2",
                  inMonth
                    ? "border-[var(--ld-border-subtle)] bg-[var(--ld-bg-surface)]/40 hover:bg-[var(--ld-bg-surface)]"
                    : "border-transparent bg-transparent opacity-35",
                  isToday && "ring-1 ring-[var(--ld-accent-muted)]",
                  isSelected && "border-[var(--ld-border-default)] bg-[var(--ld-bg-glass)]",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                    isToday && "bg-[var(--ld-accent-glow)] text-[var(--ld-accent)]",
                  )}
                >
                  {format(day, "d")}
                </span>
                <div className="mt-1 space-y-1">
                  <AnimatePresence mode="popLayout">
                    {items.slice(0, 3).map((p) => (
                      <PaymentChip key={p.id} payment={p} compact />
                    ))}
                  </AnimatePresence>
                  {items.length > 3 && (
                    <p className="text-[10px] text-[var(--ld-text-muted)]">+{items.length - 3} más</p>
                  )}
                </div>
              </button>
            );
          })}
        </motion.div>
      </div>

      {selectedDay && byDate.get(selectedDay) && (
        <DayDetailPanel
          date={selectedDay}
          payments={byDate.get(selectedDay)!}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </GlassCard>
  );
}

function PaymentChip({ payment, compact }: { payment: CalendarPayment; compact?: boolean }) {
  const isExpense = payment.kind === "expense";
  const isPipeline = payment.kind === "pipeline";
  const pending = payment.kind === "income" && payment.status === "pendiente";
  const recurring = payment.origin === "recurrente";

  const chip = (
    <div
      className={cn(
        "flex w-full items-center gap-1 rounded-md border px-1 py-0.5",
        isPipeline || pending ? "border-dashed" : "border-solid",
        isExpense
          ? "border-[var(--ld-danger)]/35 bg-[var(--ld-danger)]/10"
          : isPipeline
            ? "border-[var(--ld-accent-muted)] bg-[var(--ld-accent-glow)]"
            : pending
              ? "border-[var(--ld-warning)]/40 bg-[var(--ld-warning)]/8"
              : "border-[var(--ld-success)]/30 bg-[var(--ld-success)]/8",
      )}
    >
      <SourceLogo slug={payment.sourceSlug} name={payment.sourceName} size={compact ? 18 : 22} className="rounded-md" />
      <span className="ld-sensitive min-w-0 flex-1 truncate text-[10px] font-medium tabular-nums leading-tight">
        {isExpense ? "−" : "+"}
        {formatCurrency(payment.amount, { maximumFractionDigits: 0 })}
      </span>
      {recurring && <Repeat className="h-2.5 w-2.5 shrink-0 text-[var(--ld-text-muted)]" />}
    </div>
  );

  if (compact) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <div className="cursor-pointer">{chip}</div>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <PaymentDetail payment={payment} />
        </PopoverContent>
      </Popover>
    );
  }

  return chip;
}

function PaymentDetail({ payment }: { payment: CalendarPayment }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <SourceLogo slug={payment.sourceSlug} name={payment.sourceName} size={36} />
        <div>
          <p className="text-sm font-medium">{payment.sourceName}</p>
          <p className="text-xs capitalize text-[var(--ld-text-muted)]">
            {payment.kind === "expense" ? "Gasto" : payment.status}
          </p>
        </div>
      </div>
      <p className="ld-sensitive text-lg font-semibold tabular-nums">
        {payment.kind === "expense" ? "−" : ""}
        {formatCurrency(payment.amount)}
      </p>
      {payment.concept && (
        <p className="text-sm text-[var(--ld-text-secondary)]">{payment.concept}</p>
      )}
    </div>
  );
}

function DayDetailPanel({
  date,
  payments,
  onClose,
}: {
  date: string;
  payments: CalendarPayment[];
  onClose: () => void;
}) {
  const d = parseISO(date);
  return (
    <div className="border-t border-[var(--ld-border-subtle)] bg-[rgba(8,8,12,0.5)] px-5 py-4 sm:px-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-medium capitalize">
          {format(d, "EEEE d 'de' MMMM", { locale: es })}
        </h3>
        <GlassButton size="sm" variant="ghost" onClick={onClose}>
          Cerrar
        </GlassButton>
      </div>
      <div className="space-y-2">
        {payments.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 rounded-[var(--ld-radius-md)] border border-[var(--ld-border-subtle)] bg-[var(--ld-bg-surface)] p-3"
          >
            <SourceLogo slug={p.sourceSlug} name={p.sourceName} size={40} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{p.sourceName}</p>
              <p className="ld-sensitive text-base font-semibold tabular-nums">
                {p.kind === "expense" ? "−" : ""}
                {formatCurrency(p.amount)}
              </p>
              {p.concept && (
                <p className="text-xs text-[var(--ld-text-muted)]">{p.concept}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
