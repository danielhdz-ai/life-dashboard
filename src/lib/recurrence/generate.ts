import {
  addMonths,
  endOfMonth,
  format,
  isBefore,
  isAfter,
  startOfMonth,
} from "date-fns";

export type RecurringRuleInput = {
  id: string;
  kind: "income" | "expense";
  sourceId: string | null;
  amountNet: number;
  amountGross: number | null;
  dayOfMonth: number;
  startDate: string;
  endDate: string | null;
  concept: string | null;
  expenseCategory?: string | null;
};

export type GeneratedOccurrence = {
  ruleId: string;
  kind: "income" | "expense";
  sourceId: string | null;
  date: string;
  amountNet: number;
  amountGross: number;
  concept: string | null;
  expenseCategory?: string | null;
};

function clampDay(year: number, month: number, day: number): Date {
  const last = endOfMonth(new Date(year, month, 1)).getDate();
  return new Date(year, month, Math.min(day, last));
}

/** Genera ocurrencias en un rango [from, to] sin duplicar las ya materializadas. */
export function generateOccurrences(
  rules: RecurringRuleInput[],
  from: Date,
  to: Date,
  existingKeys: Set<string>,
): GeneratedOccurrence[] {
  const out: GeneratedOccurrence[] = [];

  for (const rule of rules) {
    if (!rule.sourceId && rule.kind === "income") continue;

    const start = startOfMonth(new Date(rule.startDate));
    const end = rule.endDate ? new Date(rule.endDate) : to;
    let cursor = startOfMonth(from < start ? start : from);

    while (!isAfter(cursor, to) && !isAfter(cursor, end)) {
      const occDate = clampDay(
        cursor.getFullYear(),
        cursor.getMonth(),
        rule.dayOfMonth,
      );

      if (!isBefore(occDate, start) && !isAfter(occDate, to) && !isAfter(occDate, end)) {
        const key = `${rule.id}:${format(occDate, "yyyy-MM-dd")}`;
        if (!existingKeys.has(key)) {
          const gross = rule.amountGross ?? rule.amountNet;
          out.push({
            ruleId: rule.id,
            kind: rule.kind,
            sourceId: rule.sourceId,
            date: format(occDate, "yyyy-MM-dd"),
            amountNet: rule.amountNet,
            amountGross: gross,
            concept: rule.concept,
            expenseCategory: rule.expenseCategory ?? undefined,
          });
        }
      }

      cursor = addMonths(cursor, 1);
    }
  }

  return out;
}

export function recurringMaterializeKey(ruleId: string, date: string) {
  return `${ruleId}:${date}`;
}
