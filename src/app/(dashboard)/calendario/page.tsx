import { connection } from "next/server";
import { redirect } from "next/navigation";

import { PaymentCalendar } from "@/components/dashboard/payment-calendar";
import { fetchCalendarMonth } from "@/lib/dashboard/calendar-queries";
import { createClient } from "@/lib/supabase/server";

export default async function CalendarioPage() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const calendar = await fetchCalendarMonth(supabase, user.id, new Date());

  return (
    <div className="mx-auto max-w-[1600px]">
      <PaymentCalendar initial={calendar} />
    </div>
  );
}
