import { connection } from "next/server";
import { redirect } from "next/navigation";

import { PaymentCalendar } from "@/components/dashboard/payment-calendar";
import { fetchCalendarMonth } from "@/lib/dashboard/calendar-queries";
import { getServerDataClient } from "@/lib/supabase/data-client";

export default async function CalendarioPage() {
  await connection();
  const ctx = await getServerDataClient();
  if (!ctx) redirect("/login");

  const calendar = await fetchCalendarMonth(ctx.supabase, ctx.userId, new Date());

  return (
    <div className="mx-auto max-w-[1600px]">
      <PaymentCalendar initial={calendar} />
    </div>
  );
}
