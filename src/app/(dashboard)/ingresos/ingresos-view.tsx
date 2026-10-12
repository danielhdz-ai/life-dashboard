"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { GlassButton } from "@/components/glass/glass-button";
import { GlassCard } from "@/components/glass/glass-card";
import { GlassInput } from "@/components/glass/glass-input";
import { createIncome } from "@/lib/actions/incomes";
import { formatCurrency } from "@/lib/format";

type Source = { id: string; slug: string; name: string };

type Props = {
  sources: Source[];
  incomes: Record<string, unknown>[];
  expenses: Record<string, unknown>[];
};

export function IngresosView({ sources, incomes, expenses }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [sourceId, setSourceId] = useState(sources[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [concept, setConcept] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!sourceId || !value) return;
    startTransition(async () => {
      await createIncome({
        sourceId,
        amountGross: value,
        amountNet: value,
        incomeDate: date,
        status: "cobrado",
        concept: concept || undefined,
      });
      setOpen(false);
      setAmount("");
      setConcept("");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Ingresos y gastos</h1>
          <p className="text-sm text-[var(--ld-text-secondary)]">
            Alta manual, filtros avanzados y CSV en iteraciones siguientes.
          </p>
        </div>
        <GlassButton variant="accent" onClick={() => setOpen((v) => !v)}>
          {open ? "Cerrar" : "Añadir ingreso"}
        </GlassButton>
      </div>

      {open && (
        <GlassCard className="p-6">
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-[var(--ld-text-muted)]">Fuente</label>
              <select
                className="h-10 w-full rounded-[var(--ld-radius-md)] border border-[var(--ld-border-subtle)] bg-[var(--ld-bg-surface)] px-3 text-sm"
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
              >
                {sources.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--ld-text-muted)]">Importe (€)</label>
              <GlassInput
                type="number"
                min="0"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--ld-text-muted)]">Fecha</label>
              <GlassInput
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--ld-text-muted)]">Concepto</label>
              <GlassInput value={concept} onChange={(e) => setConcept(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <GlassButton type="submit" variant="accent" disabled={pending}>
                {pending ? "Guardando…" : "Guardar ingreso"}
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      )}

      <GlassCard className="overflow-hidden p-0">
        <div className="border-b border-[var(--ld-border-subtle)] px-5 py-3 text-sm font-medium">
          Ingresos recientes
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[var(--ld-text-muted)]">
              <tr className="border-b border-[var(--ld-border-subtle)]">
                <th className="px-5 py-2 font-medium">Fecha</th>
                <th className="px-5 py-2 font-medium">Fuente</th>
                <th className="px-5 py-2 font-medium">Concepto</th>
                <th className="px-5 py-2 font-medium">Estado</th>
                <th className="px-5 py-2 text-right font-medium">Neto</th>
              </tr>
            </thead>
            <tbody>
              {incomes.map((row) => {
                const src = row.income_sources as { name?: string } | null;
                return (
                  <tr key={String(row.id)} className="border-b border-[var(--ld-border-subtle)]/60">
                    <td className="px-5 py-2.5">{String(row.income_date)}</td>
                    <td className="px-5 py-2.5">{src?.name ?? "—"}</td>
                    <td className="px-5 py-2.5 text-[var(--ld-text-secondary)]">
                      {String(row.concept ?? "—")}
                    </td>
                    <td className="px-5 py-2.5 capitalize">{String(row.status)}</td>
                    <td className="ld-sensitive px-5 py-2.5 text-right tabular-nums">
                      {formatCurrency(Number(row.amount_net))}
                    </td>
                  </tr>
                );
              })}
              {!incomes.length && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-[var(--ld-text-muted)]">
                    Aún no hay ingresos. Mercat Immobiliari se generará solo vía recurrencia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden p-0">
        <div className="border-b border-[var(--ld-border-subtle)] px-5 py-3 text-sm font-medium">
          Gastos recientes
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[var(--ld-text-muted)]">
              <tr className="border-b border-[var(--ld-border-subtle)]">
                <th className="px-5 py-2 font-medium">Fecha</th>
                <th className="px-5 py-2 font-medium">Negocio</th>
                <th className="px-5 py-2 font-medium">Categoría</th>
                <th className="px-5 py-2 text-right font-medium">Importe</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((row) => {
                const src = row.income_sources as { name?: string } | null;
                return (
                  <tr key={String(row.id)} className="border-b border-[var(--ld-border-subtle)]/60">
                    <td className="px-5 py-2.5">{String(row.expense_date)}</td>
                    <td className="px-5 py-2.5">{src?.name ?? "General"}</td>
                    <td className="px-5 py-2.5">{String(row.category)}</td>
                    <td className="ld-sensitive px-5 py-2.5 text-right tabular-nums">
                      {formatCurrency(Number(row.amount))}
                    </td>
                  </tr>
                );
              })}
              {!expenses.length && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-[var(--ld-text-muted)]">
                    Sin gastos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
