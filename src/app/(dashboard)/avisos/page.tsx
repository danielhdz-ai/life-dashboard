import { redirect } from "next/navigation";

import { AvisosView } from "@/app/(dashboard)/avisos/avisos-view";
import { getServerDataClient } from "@/lib/supabase/data-client";

export default async function AvisosPage() {
  const ctx = await getServerDataClient();
  if (!ctx) redirect("/login");
  const { supabase, userId } = ctx;

  const { data: alerts } = await supabase
    .from("payment_alerts")
    .select(
      "*, income_sources(name, slug), email_messages_meta(subject, from_address, snippet)",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  return <AvisosView alerts={alerts ?? []} />;
}
