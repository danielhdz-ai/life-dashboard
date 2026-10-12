"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { formatCurrency } from "@/lib/format";

type Props = {
  data: { name: string; value: number; color: string }[];
};

export function SourceDonut({ data }: Props) {
  const filtered = data.filter((d) => d.value > 0);
  const empty = filtered.length === 0;

  return (
    <div className="h-48 w-full">
      {empty ? (
        <div className="flex h-full items-center justify-center text-sm text-[var(--ld-text-faint)]">
          Sin ingresos este mes
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={filtered}
              dataKey="value"
              nameKey="name"
              innerRadius="58%"
              outerRadius="82%"
              paddingAngle={2}
              stroke="rgba(0,0,0,0.2)"
            >
              {filtered.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{
                background: "rgba(12,12,18,0.95)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
