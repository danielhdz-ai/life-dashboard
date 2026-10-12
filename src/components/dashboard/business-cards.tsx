"use client";

import Link from "next/link";
import { Line, LineChart, ResponsiveContainer } from "recharts";

import { SourceLogo } from "@/components/dashboard/source-logo";
import { GlassCard } from "@/components/glass/glass-card";
import { formatCurrency } from "@/lib/format";
import { sortBusinessesByLogoOrder } from "@/lib/sources/logos";

type Business = {
  slug: string;
  name: string;
  color: string;
  income: number;
  expenses: number;
  net: number;
  sparkline: number[];
};

export function BusinessCards({ businesses }: { businesses: Business[] }) {
  const ordered = sortBusinessesByLogoOrder(businesses);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {ordered.map((b) => (
        <Link key={b.slug} href={`/fuentes/${b.slug}`}>
          <GlassCard className="h-full p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex gap-3">
                <SourceLogo slug={b.slug} name={b.name} size={44} />
                <div>
                <p className="text-sm font-medium">{b.name}</p>
                <p className="ld-sensitive mt-1 text-xl font-semibold tabular-nums">
                  {formatCurrency(b.net)}
                </p>
                <p className="mt-1 text-xs text-[var(--ld-text-muted)]">
                  <span className="ld-sensitive">{formatCurrency(b.income)}</span> ing. ·{" "}
                  <span className="ld-sensitive">{formatCurrency(b.expenses)}</span> gastos
                </p>
                </div>
              </div>
              <div className="h-10 w-20 opacity-90">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={b.sparkline.map((v, i) => ({ i, v }))}
                    margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
                  >
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke={b.color}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </GlassCard>
        </Link>
      ))}
    </div>
  );
}
