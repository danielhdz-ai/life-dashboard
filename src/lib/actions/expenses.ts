"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase.from("expenses").insert({
    user_id: user.id,
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
