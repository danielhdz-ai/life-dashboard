import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

import { SourceLogo } from "@/components/dashboard/source-logo";
import { GlassCard } from "@/components/glass/glass-card";
import type { CalendarPayment } from "@/lib/dashboard/calendar-queries";
import { formatCurrency } from "@/lib/format";

type Props = {
  payments: CalendarPayment[];
  days?: number;
};

export function UpcomingPayments({ payments, days = 14 }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const limit = new Date(today);
  limit.setDate(limit.getDate() + days);

  const upcoming = payments
    .filter((p) => {
      const d = parseISO(p.date);
      return d >= today && d <= limit && p.kind === "income";
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);

  return (
    <GlassCard className="p-5" spotlight={false}>
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--ld-text-faint)]">
        Próximos cobros
      </p>
      <h3 className="mt-1 text-lg font-medium">14 días</h3>
      <ul className="mt-4 space-y-3">
        {upcoming.length === 0 && (
          <li className="text-sm text-[var(--ld-text-muted)]">Sin cobros previstos.</li>
        )}
        {upcoming.map((p) => (
          <li key={p.id} className="flex items-center gap-3">
            <SourceLogo slug={p.sourceSlug} name={p.sourceName} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{p.sourceName}</p>
              <p className="text-xs capitalize text-[var(--ld-text-muted)]">
                {format(parseISO(p.date), "EEE d MMM", { locale: es })} · {p.status}
              </p>
            </div>
            <span className="ld-sensitive text-sm font-semibold tabular-nums">
              {formatCurrency(p.amount)}
            </span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
