import { connection } from "next/server";
import { redirect } from "next/navigation";

import { HomePage } from "@/app/(dashboard)/home-page";
import { fetchCalendarMonth } from "@/lib/dashboard/calendar-queries";
import {
  ensureUserSeed,
  fetchDashboardSummary,
} from "@/lib/dashboard/queries";
import { syncRecurringEntries } from "@/lib/db/recurring-sync";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function Page() {
  await connection();
  const now = new Date();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return (
      <HomePage
        summary={null}
        calendar={null}
        missingConfig="supabase"
        todayLabel=""
        greetingHour={now.getHours()}
      />
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

  const [summary, calendar] = await Promise.all([
    fetchDashboardSummary(supabase, user.id),
    fetchCalendarMonth(supabase, user.id, now),
  ]);

  return (
    <HomePage
      summary={summary}
      calendar={calendar}
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
