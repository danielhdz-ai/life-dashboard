import { redirect } from "next/navigation";

import { IngresosView } from "@/app/(dashboard)/ingresos/ingresos-view";
import { createClient } from "@/lib/supabase/server";

export default async function IngresosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: sources }, { data: incomes }, { data: expenses }] = await Promise.all([
    supabase
      .from("income_sources")
      .select("id, slug, name")
      .eq("user_id", user.id)
      .order("sort_order"),
    supabase
      .from("incomes")
      .select("*, income_sources(name, slug)")
      .eq("user_id", user.id)
      .order("income_date", { ascending: false })
      .limit(100),
    supabase
      .from("expenses")
      .select("*, income_sources(name, slug)")
      .eq("user_id", user.id)
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
