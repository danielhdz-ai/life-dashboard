import { connection } from "next/server";
import { redirect } from "next/navigation";

import { HomePage } from "@/app/(dashboard)/home-page";
import { fetchCalendarMonth } from "@/lib/dashboard/calendar-queries";
import {
  ensureUserSeed,
  fetchDashboardSummary,
} from "@/lib/dashboard/queries";
import { syncRecurringEntries } from "@/lib/db/recurring-sync";
import { getServerDataClient } from "@/lib/supabase/data-client";

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

  const ctx = await getServerDataClient();
  if (!ctx) {
    redirect("/login");
  }

  const { supabase, userId } = ctx;

  await ensureUserSeed(supabase, userId);
  await syncRecurringEntries(supabase, userId);

  const [summary, calendar] = await Promise.all([
    fetchDashboardSummary(supabase, userId),
    fetchCalendarMonth(supabase, userId, now),
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
