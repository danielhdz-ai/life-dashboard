import { redirect } from "next/navigation";

import { AvisosView } from "@/app/(dashboard)/avisos/avisos-view";
import { createClient } from "@/lib/supabase/server";

export default async function AvisosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: alerts } = await supabase
    .from("payment_alerts")
    .select(
      "*, income_sources(name, slug), email_messages_meta(subject, from_address, snippet)",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return <AvisosView alerts={alerts ?? []} />;
}
