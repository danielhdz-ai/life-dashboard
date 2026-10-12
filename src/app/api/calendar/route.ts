import { NextResponse } from "next/server";
import { parseISO } from "date-fns";

import { fetchCalendarMonth } from "@/lib/dashboard/calendar-queries";
import { getServerDataClient } from "@/lib/supabase/data-client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "Parámetro month inválido (yyyy-MM)" }, { status: 400 });
  }

  const ctx = await getServerDataClient();
  if (!ctx) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const viewDate = parseISO(`${month}-01`);
  const data = await fetchCalendarMonth(ctx.supabase, ctx.userId, viewDate);
  return NextResponse.json(data);
}
