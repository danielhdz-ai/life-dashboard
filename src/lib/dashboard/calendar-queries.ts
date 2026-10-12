import { endOfMonth, format, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import type { SupabaseClient } from "@supabase/supabase-js";

export type CalendarPayment = {
  id: string;
  date: string;
  amount: number;
  kind: "income" | "expense" | "pipeline";
  status: "pendiente" | "cobrado" | "pagado";
  probability?: number;
  concept: string | null;
  sourceSlug: string;
  sourceName: string;
  origin?: string;
};

export type CalendarMonthSummary = {
  monthKey: string;
  monthLabel: string;
  totalIncome: number;
  totalExpense: number;
  collected: number;
  pending: number;
  payments: CalendarPayment[];
};

export async function fetchCalendarMonth(
  supabase: SupabaseClient,
  userId: string,
  viewDate: Date,
): Promise<CalendarMonthSummary> {
  const monthStart = format(startOfMonth(viewDate), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(viewDate), "yyyy-MM-dd");
  const monthKey = format(viewDate, "yyyy-MM");

  const [{ data: incomes }, { data: expenses }, { data: pipeline }, { data: sources }] =
    await Promise.all([
    supabase
      .from("incomes")
      .select(
        "id, amount_net, income_date, status, concept, origin, income_sources(slug, name)",
      )
      .eq("user_id", userId)
      .gte("income_date", monthStart)
      .lte("income_date", monthEnd)
      .order("income_date"),
    supabase
      .from("expenses")
      .select("id, amount, expense_date, concept, income_sources(slug, name)")
      .eq("user_id", userId)
      .gte("expense_date", monthStart)
      .lte("expense_date", monthEnd)
      .order("expense_date"),
    supabase
      .from("pipeline_deals")
      .select("id, expected_amount, expected_date, probability, title, income_sources(slug, name)")
      .eq("user_id", userId)
      .eq("status", "en_curso")
      .gte("expected_date", monthStart)
      .lte("expected_date", monthEnd),
    supabase
      .from("income_sources")
      .select("slug, name")
      .eq("user_id", userId),
  ]);

  const sourceBySlug = new Map((sources ?? []).map((s) => [s.slug, s.name]));

  const payments: CalendarPayment[] = [];

  for (const row of incomes ?? []) {
    const src = row.income_sources as { slug?: string; name?: string } | null;
    const slug = src?.slug ?? "livendia";
    payments.push({
      id: row.id,
      date: row.income_date as string,
      amount: Number(row.amount_net),
      kind: "income",
      status: row.status as "pendiente" | "cobrado",
      concept: row.concept,
      sourceSlug: slug,
      sourceName: src?.name ?? sourceBySlug.get(slug) ?? slug,
      origin: row.origin ?? undefined,
    });
  }

  for (const row of expenses ?? []) {
    const src = row.income_sources as { slug?: string; name?: string } | null;
    const slug = src?.slug ?? "general";
    payments.push({
      id: row.id,
      date: row.expense_date as string,
      amount: Number(row.amount),
      kind: "expense",
      status: "pagado",
      concept: row.concept,
      sourceSlug: slug,
      sourceName: src?.name ?? (slug === "general" ? "Gasto general" : slug),
    });
  }

  for (const deal of pipeline ?? []) {
    const src = deal.income_sources as { slug?: string; name?: string } | null;
    const slug = src?.slug ?? "livendia";
    payments.push({
      id: deal.id,
      date: deal.expected_date as string,
      amount: Number(deal.expected_amount),
      kind: "pipeline",
      status: "pendiente",
      probability: deal.probability as number,
      concept: deal.title as string,
      sourceSlug: slug,
      sourceName: src?.name ?? slug,
    });
  }

  payments.sort((a, b) => a.date.localeCompare(b.date));

  const totalIncome = payments
    .filter((p) => p.kind === "income")
    .reduce((s, p) => s + p.amount, 0);
  const totalExpense = payments
    .filter((p) => p.kind === "expense")
    .reduce((s, p) => s + p.amount, 0);
  const collected = payments
    .filter((p) => p.kind === "income" && p.status === "cobrado")
    .reduce((s, p) => s + p.amount, 0);
  const pending = payments
    .filter((p) => p.kind === "income" && p.status === "pendiente")
    .reduce((s, p) => s + p.amount, 0);

  return {
    monthKey,
    monthLabel: format(viewDate, "MMMM yyyy", { locale: es }),
    totalIncome,
    totalExpense,
    collected,
    pending,
    payments,
  };
}
