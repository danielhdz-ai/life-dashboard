"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase.from("incomes").insert({
    user_id: user.id,
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await syncRecurringEntries(supabase, user.id);
  revalidatePath("/");
}
