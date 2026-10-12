import { NextResponse } from "next/server";

import { syncAllEmailAccounts } from "@/lib/email/sync-all";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const results = await syncAllEmailAccounts();
    return NextResponse.json({ ok: true, results });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error de sync";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
