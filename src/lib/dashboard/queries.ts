import {
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
  eachMonthOfInterval,
} from "date-fns";
import { es } from "date-fns/locale";
import type { SupabaseClient } from "@supabase/supabase-js";

import { colors } from "@/lib/design-tokens";

export type IncomeSourceRow = {
  id: string;
  slug: string;
  name: string;
  color: string;
  source_type: string;
};

export type DashboardSummary = {
  monthLabel: string;
  netProfit: number;
  grossIncome: number;
  collected: number;
  pending: number;
  prevMonthNet: number;
  goalTarget: number | null;
  goalProgress: number;
  monthlyChart: { month: string; [sourceSlug: string]: number | string }[];
  sourceBreakdown: { name: string; value: number; color: string }[];
  businesses: {
    slug: string;
    name: string;
    color: string;
    income: number;
    expenses: number;
    net: number;
    sparkline: number[];
  }[];
};

const sourceColorBySlug: Record<string, string> = {
  livendia: colors.sources.livendia,
  inmonest: colors.sources.inmonest,
  firmacert: colors.sources.firmacert,
  "mercat-immobiliari": colors.sources.mercat,
  nuevahabitat: colors.sources.nuevahabitat,
};

export async function fetchDashboardSummary(
  supabase: SupabaseClient,
  userId: string,
): Promise<DashboardSummary> {
  const now = new Date();
  const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(now), "yyyy-MM-dd");
  const prevStart = format(startOfMonth(subMonths(now, 1)), "yyyy-MM-dd");
  const prevEnd = format(endOfMonth(subMonths(now, 1)), "yyyy-MM-dd");
  const chartFrom = format(startOfMonth(subMonths(now, 11)), "yyyy-MM-dd");

  const { data: sources } = await supabase
    .from("income_sources")
    .select("id, slug, name, color, source_type")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("sort_order");

  const sourceList = (sources ?? []) as IncomeSourceRow[];

  const [incomesRes, expensesRes, prevIncomesRes, prevExpensesRes, chartIncomesRes, goalRes] =
    await Promise.all([
      supabase
        .from("incomes")
        .select("amount_net, amount_gross, status, source_id, income_date")
        .eq("user_id", userId)
        .gte("income_date", monthStart)
        .lte("income_date", monthEnd),
      supabase
        .from("expenses")
        .select("amount, source_id")
        .eq("user_id", userId)
        .gte("expense_date", monthStart)
        .lte("expense_date", monthEnd),
      supabase
        .from("incomes")
        .select("amount_net")
        .eq("user_id", userId)
        .gte("income_date", prevStart)
        .lte("income_date", prevEnd),
      supabase
        .from("expenses")
        .select("amount")
        .eq("user_id", userId)
        .gte("expense_date", prevStart)
        .lte("expense_date", prevEnd),
      supabase
        .from("incomes")
        .select("amount_net, source_id, income_date")
        .eq("user_id", userId)
        .gte("income_date", chartFrom)
        .lte("income_date", monthEnd),
      supabase
        .from("goals")
        .select("target_net")
        .eq("user_id", userId)
        .eq("period", "monthly")
        .eq("year", now.getFullYear())
        .eq("month", now.getMonth() + 1)
        .maybeSingle(),
    ]);

  const incomes = incomesRes.data ?? [];
  const expenses = expensesRes.data ?? [];

  const grossIncome = incomes.reduce((s, i) => s + Number(i.amount_gross), 0);
  const incomeNet = incomes.reduce((s, i) => s + Number(i.amount_net), 0);
  const expenseTotal = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const netProfit = incomeNet - expenseTotal;

  const collected = incomes
    .filter((i) => i.status === "cobrado")
    .reduce((s, i) => s + Number(i.amount_net), 0);
  const pending = incomes
    .filter((i) => i.status === "pendiente")
    .reduce((s, i) => s + Number(i.amount_net), 0);

  const prevNet =
    (prevIncomesRes.data ?? []).reduce((s, i) => s + Number(i.amount_net), 0) -
    (prevExpensesRes.data ?? []).reduce((s, e) => s + Number(e.amount), 0);

  const goalTarget = goalRes.data?.target_net != null ? Number(goalRes.data.target_net) : null;
  const goalProgress =
    goalTarget && goalTarget > 0 ? Math.min(100, (netProfit / goalTarget) * 100) : 0;

  const months = eachMonthOfInterval({
    start: subMonths(now, 11),
    end: now,
  });

  const monthlyChart = months.map((m) => {
    const key = format(m, "yyyy-MM");
    const label = format(m, "MMM yy", { locale: es });
    const row: { month: string; [k: string]: number | string } = { month: label };
    for (const src of sourceList) {
      row[src.slug] = 0;
    }
    for (const inc of chartIncomesRes.data ?? []) {
      const incKey = (inc.income_date as string).slice(0, 7);
      if (incKey !== key) continue;
      const src = sourceList.find((s) => s.id === inc.source_id);
      if (src) row[src.slug] = Number(row[src.slug] ?? 0) + Number(inc.amount_net);
    }
    return row;
  });

  const sourceBreakdown = sourceList.map((src) => ({
    name: src.name,
    value: incomes
      .filter((i) => i.source_id === src.id)
      .reduce((s, i) => s + Number(i.amount_net), 0),
    color: sourceColorBySlug[src.slug] ?? src.color,
  }));

  const businesses = await Promise.all(
    sourceList.map(async (src) => {
      const inc = incomes
        .filter((i) => i.source_id === src.id)
        .reduce((s, i) => s + Number(i.amount_net), 0);
      const exp = expenses
        .filter((e) => e.source_id === src.id)
        .reduce((s, e) => s + Number(e.amount), 0);

      const sparkFrom = format(subMonths(now, 5), "yyyy-MM-dd");
      const { data: sparkRows } = await supabase
        .from("incomes")
        .select("amount_net, income_date")
        .eq("user_id", userId)
        .eq("source_id", src.id)
        .gte("income_date", sparkFrom)
        .lte("income_date", monthEnd);

      const sparkMonths = eachMonthOfInterval({ start: subMonths(now, 5), end: now });
      const sparkline = sparkMonths.map((m) => {
        const mk = format(m, "yyyy-MM");
        return (sparkRows ?? [])
          .filter((r) => (r.income_date as string).startsWith(mk))
          .reduce((s, r) => s + Number(r.amount_net), 0);
      });

      return {
        slug: src.slug,
        name: src.name,
        color: sourceColorBySlug[src.slug] ?? src.color,
        income: inc,
        expenses: exp,
        net: inc - exp,
        sparkline,
      };
    }),
  );

  return {
    monthLabel: format(now, "MMMM yyyy", { locale: es }),
    netProfit,
    grossIncome,
    collected,
    pending,
    prevMonthNet: prevNet,
    goalTarget,
    goalProgress,
    monthlyChart,
    sourceBreakdown,
    businesses,
  };
}

export async function ensureUserSeed(supabase: SupabaseClient, userId: string) {
  await supabase.rpc("seed_default_income_sources", { p_user_id: userId });
}
