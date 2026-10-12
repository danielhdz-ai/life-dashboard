import type { SupabaseClient } from "@supabase/supabase-js";

import {
  generateOccurrences,
  recurringMaterializeKey,
  type RecurringRuleInput,
} from "@/lib/recurrence/generate";

export async function syncRecurringEntries(
  supabase: SupabaseClient,
  userId: string,
  windowMonths = 3,
) {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const to = new Date(now.getFullYear(), now.getMonth() + windowMonths, 28);

  const { data: rules, error: rulesError } = await supabase
    .from("recurring_rules")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true);

  if (rulesError || !rules?.length) return;

  const { data: existingIncomes } = await supabase
    .from("incomes")
    .select("recurring_rule_id, income_date")
    .eq("user_id", userId)
    .not("recurring_rule_id", "is", null);

  const existingKeys = new Set<string>();
  for (const row of existingIncomes ?? []) {
    if (row.recurring_rule_id && row.income_date) {
      existingKeys.add(recurringMaterializeKey(row.recurring_rule_id, row.income_date));
    }
  }

  const mapped: RecurringRuleInput[] = rules.map((r) => ({
    id: r.id,
    kind: r.kind,
    sourceId: r.source_id,
    amountNet: Number(r.amount_net),
    amountGross: r.amount_gross != null ? Number(r.amount_gross) : null,
    dayOfMonth: r.day_of_month,
    startDate: r.start_date,
    endDate: r.end_date,
    concept: r.concept,
    expenseCategory: r.expense_category,
  }));

  const occurrences = generateOccurrences(mapped, from, to, existingKeys).filter(
    (o) => o.kind === "income" && o.sourceId,
  );

  if (!occurrences.length) return;

  const rows = occurrences.map((o) => ({
    user_id: userId,
    source_id: o.sourceId!,
    amount_gross: o.amountGross,
    amount_net: o.amountNet,
    income_date: o.date,
    status: "pendiente" as const,
    concept: o.concept,
    origin: "recurrente" as const,
    recurring_rule_id: o.ruleId,
  }));

  await supabase.from("incomes").insert(rows);
}
