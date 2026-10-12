"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireServerDataClient } from "@/lib/supabase/data-client";

export async function confirmPaymentAlert(alertId: string) {
  const { supabase, userId } = await requireServerDataClient();

  const { data: alert, error } = await supabase
    .from("payment_alerts")
    .select("*")
    .eq("id", alertId)
    .eq("user_id", userId)
    .single();

  if (error || !alert) throw new Error("Aviso no encontrado");
  if (alert.status !== "por_revisar") return;

  let sourceId = alert.source_id as string | null;
  if (!sourceId && alert.detected_type === "ingreso") {
    const { data: fallback } = await supabase
      .from("income_sources")
      .select("id")
      .eq("user_id", userId)
      .order("sort_order")
      .limit(1)
      .maybeSingle();
    sourceId = fallback?.id ?? null;
  }

  if (alert.detected_type === "ingreso" && alert.amount && sourceId) {
    await supabase.from("incomes").insert({
      user_id: userId,
      source_id: sourceId,
      amount_gross: alert.amount,
      amount_net: alert.amount,
      income_date: alert.payment_date ?? new Date().toISOString().slice(0, 10),
      status: "cobrado",
      concept: alert.concept,
      origin: "email",
      email_message_id: alert.message_id,
    });
  }

  if (alert.detected_type === "gasto" && alert.amount) {
    await supabase.from("expenses").insert({
      user_id: userId,
      source_id: alert.source_id,
      amount: alert.amount,
      expense_date: alert.payment_date ?? new Date().toISOString().slice(0, 10),
      concept: alert.concept,
      category: "otros",
    });
  }

  await supabase
    .from("payment_alerts")
    .update({ status: "confirmado" })
    .eq("id", alertId);

  revalidatePath("/");
  revalidatePath("/avisos");
  revalidatePath("/calendario");
}

export async function discardPaymentAlert(alertId: string) {
  const { supabase, userId } = await requireServerDataClient();

  await supabase
    .from("payment_alerts")
    .update({ status: "descartado" })
    .eq("id", alertId)
    .eq("user_id", userId);

  revalidatePath("/avisos");
}

export async function disconnectEmailAccount(accountId: string) {
  const { userId } = await requireServerDataClient();

  const admin = createAdminClient();
  await admin
    .from("email_accounts")
    .update({ is_active: false })
    .eq("id", accountId)
    .eq("user_id", userId);

  revalidatePath("/ajustes");
}
