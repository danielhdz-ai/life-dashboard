"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireServerDataClient } from "@/lib/supabase/data-client";

const expenseSchema = z.object({
  sourceId: z.string().uuid().optional(),
  amount: z.coerce.number().positive(),
  expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category: z.enum([
    "hosting",
    "ia_apis",
    "dominios",
    "publicidad",
    "software",
    "otros",
  ]),
  concept: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
});

export async function createExpense(input: z.infer<typeof expenseSchema>) {
  const parsed = expenseSchema.parse(input);
  const { supabase, userId } = await requireServerDataClient();

  const { error } = await supabase.from("expenses").insert({
    user_id: userId,
    source_id: parsed.sourceId ?? null,
    amount: parsed.amount,
    expense_date: parsed.expenseDate,
    category: parsed.category,
    concept: parsed.concept ?? null,
    notes: parsed.notes ?? null,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/ingresos");
}
