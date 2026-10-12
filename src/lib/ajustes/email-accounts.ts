import { createAdminClient } from "@/lib/supabase/admin";

export type EmailAccountSummary = {
  id: string;
  email_address: string;
  provider: string;
  last_sync_at: string | null;
  sync_error: string | null;
  is_active: boolean;
};

export async function listEmailAccountsForUser(userId: string): Promise<EmailAccountSummary[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("email_accounts")
    .select("id, email_address, provider, last_sync_at, sync_error, is_active")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at");

  if (error) return [];
  return data ?? [];
}
