import { describe, expect, it } from "vitest";

import { generateOccurrences, recurringMaterializeKey } from "@/lib/recurrence/generate";

describe("generateOccurrences", () => {
  it("genera Mercat 1200 el día 1 de cada mes", () => {
    const rules = [
      {
        id: "rule-1",
        kind: "income" as const,
        sourceId: "src-mercat",
        amountNet: 1200,
        amountGross: 1200,
        dayOfMonth: 1,
        startDate: "2026-01-01",
        endDate: null,
        concept: "Mercat",
      },
    ];
    const from = new Date(2026, 0, 1);
    const to = new Date(2026, 2, 31);
    const existing = new Set<string>();

    const occ = generateOccurrences(rules, from, to, existing);
    expect(occ).toHaveLength(3);
    expect(occ[0].date).toBe("2026-01-01");
    expect(occ[0].amountNet).toBe(1200);
    expect(recurringMaterializeKey("rule-1", "2026-01-01")).toBe("rule-1:2026-01-01");
  });

  it("no duplica claves ya materializadas", () => {
    const rules = [
      {
        id: "rule-1",
        kind: "income" as const,
        sourceId: "src",
        amountNet: 100,
        amountGross: 100,
        dayOfMonth: 1,
        startDate: "2026-01-01",
        endDate: null,
        concept: null,
      },
    ];
    const existing = new Set(["rule-1:2026-01-01"]);
    const occ = generateOccurrences(
      rules,
      new Date(2026, 0, 1),
      new Date(2026, 1, 28),
      existing,
    );
    expect(occ).toHaveLength(1);
    expect(occ[0].date).toBe("2026-02-01");
  });
});
