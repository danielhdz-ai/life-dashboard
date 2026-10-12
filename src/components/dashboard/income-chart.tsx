"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/format";

type Props = {
  data: { month: string; [key: string]: number | string }[];
  sourceKeys: { slug: string; color: string; name: string }[];
};

export function IncomeStackedChart({ data, sourceKeys }: Props) {
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            {sourceKeys.map((s) => (
              <linearGradient key={s.slug} id={`grad-${s.slug}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.45} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.05} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${Math.round(v / 1000)}k`}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(12,12,18,0.95)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
            }}
            formatter={(value) => formatCurrency(Number(value))}
          />
          {sourceKeys.map((s) => (
            <Area
              key={s.slug}
              type="monotone"
              dataKey={s.slug}
              stackId="1"
              stroke={s.color}
              fill={`url(#grad-${s.slug})`}
              strokeWidth={1.5}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
