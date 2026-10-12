"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireServerDataClient } from "@/lib/supabase/data-client";
import { syncRecurringEntries } from "@/lib/db/recurring-sync";

const incomeSchema = z.object({
  sourceId: z.string().uuid(),
  amountGross: z.coerce.number().positive(),
  amountNet: z.coerce.number().positive(),
  vatAmount: z.coerce.number().optional(),
  incomeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["pendiente", "cobrado"]),
  concept: z.string().max(500).optional(),
  clientName: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
});

export async function createIncome(input: z.infer<typeof incomeSchema>) {
  const parsed = incomeSchema.parse(input);
  const { supabase, userId } = await requireServerDataClient();

  const { error } = await supabase.from("incomes").insert({
    user_id: userId,
    source_id: parsed.sourceId,
    amount_gross: parsed.amountGross,
    amount_net: parsed.amountNet,
    vat_amount: parsed.vatAmount ?? null,
    income_date: parsed.incomeDate,
    status: parsed.status,
    concept: parsed.concept ?? null,
    client_name: parsed.clientName ?? null,
    notes: parsed.notes ?? null,
    origin: "manual",
  });

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/ingresos");
}

export async function syncRecurrencesAction() {
  const ctx = await requireServerDataClient().catch(() => null);
  if (!ctx) return;
  await syncRecurringEntries(ctx.supabase, ctx.userId);
  revalidatePath("/");
}
