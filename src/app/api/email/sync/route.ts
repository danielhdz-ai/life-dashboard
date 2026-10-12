import { NextResponse } from "next/server";

import { syncGmailAccount } from "@/lib/email/sync-gmail-account";
import { createAdminClient } from "@/lib/supabase/admin";
import { getServerDataClient } from "@/lib/supabase/data-client";

export async function POST() {
  const ctx = await getServerDataClient();
  if (!ctx) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const admin = createAdminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const redirectUri = `${appUrl.replace(/\/$/, "")}/api/oauth/google/callback`;

  const { data: accounts } = await admin
    .from("email_accounts")
    .select("id, user_id, email_address, encrypted_tokens, history_id")
    .eq("user_id", ctx.userId)
    .eq("is_active", true);

  const results = [];
  for (const account of accounts ?? []) {
    try {
      const r = await syncGmailAccount(admin, account, redirectUri);
      results.push({ email: account.email_address, ...r, ok: true });
    } catch (e) {
      results.push({
        email: account.email_address,
        ok: false,
        error: e instanceof Error ? e.message : "Error",
      });
    }
  }

  return NextResponse.json({ results });
}
