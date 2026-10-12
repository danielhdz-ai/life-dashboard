import { redirect } from "next/navigation";

import { IngresosView } from "@/app/(dashboard)/ingresos/ingresos-view";
import { getServerDataClient } from "@/lib/supabase/data-client";

export default async function IngresosPage() {
  const ctx = await getServerDataClient();
  if (!ctx) redirect("/login");
  const { supabase, userId } = ctx;

  const [{ data: sources }, { data: incomes }, { data: expenses }] = await Promise.all([
    supabase
      .from("income_sources")
      .select("id, slug, name")
      .eq("user_id", userId)
      .order("sort_order"),
    supabase
      .from("incomes")
      .select("*, income_sources(name, slug)")
      .eq("user_id", userId)
      .order("income_date", { ascending: false })
      .limit(100),
    supabase
      .from("expenses")
      .select("*, income_sources(name, slug)")
      .eq("user_id", userId)
      .order("expense_date", { ascending: false })
      .limit(100),
  ]);

  return (
    <IngresosView
      sources={sources ?? []}
      incomes={incomes ?? []}
      expenses={expenses ?? []}
    />
  );
}
