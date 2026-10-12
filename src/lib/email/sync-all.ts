import { createAdminClient } from "@/lib/supabase/admin";

import { syncGmailAccount } from "@/lib/email/sync-gmail-account";

export async function syncAllEmailAccounts() {
  const admin = createAdminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const redirectUri = `${appUrl.replace(/\/$/, "")}/api/oauth/google/callback`;

  const { data: accounts, error } = await admin
    .from("email_accounts")
    .select("id, user_id, email_address, encrypted_tokens, history_id")
    .eq("is_active", true)
    .eq("provider", "google");

  if (error) throw new Error(error.message);

  const results = [];
  for (const account of accounts ?? []) {
    try {
      const r = await syncGmailAccount(admin, account, redirectUri);
      results.push({ email: account.email_address, ...r, ok: true });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Error desconocido";
      await admin
        .from("email_accounts")
        .update({ sync_error: message, last_sync_at: new Date().toISOString() })
        .eq("id", account.id);
      results.push({ email: account.email_address, ok: false, error: message });
    }
  }

  return results;
}
