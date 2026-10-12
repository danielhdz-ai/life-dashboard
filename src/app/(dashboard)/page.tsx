import { redirect } from "next/navigation";

import { HomePage } from "@/app/(dashboard)/home-page";
import {
  ensureUserSeed,
  fetchDashboardSummary,
} from "@/lib/dashboard/queries";
import { syncRecurringEntries } from "@/lib/db/recurring-sync";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function Page() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return (
      <HomePage summary={null} missingConfig="supabase" todayLabel="" greetingHour={12} />
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await ensureUserSeed(supabase, user.id);
  await syncRecurringEntries(supabase, user.id);
  const summary = await fetchDashboardSummary(supabase, user.id);
  const now = new Date();

  return (
    <HomePage
      summary={summary}
      todayLabel={now.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })}
      greetingHour={now.getHours()}
    />
  );
}
