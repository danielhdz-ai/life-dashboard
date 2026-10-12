import type { SupabaseClient } from "@supabase/supabase-js";

import { isOpenDashboard } from "@/lib/auth/open-dashboard";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDashboardUser } from "@/lib/supabase/dashboard-user";
import { createClient } from "@/lib/supabase/server";

export async function getServerDataClient(): Promise<{
  supabase: SupabaseClient;
  userId: string;
} | null> {
  const owner = await getDashboardUser();
  if (!owner) return null;

  const sessionClient = await createClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  if (user) {
    return { supabase: sessionClient, userId: user.id };
  }

  if (isOpenDashboard()) {
    return { supabase: createAdminClient(), userId: owner.id };
  }

  return null;
}

export async function requireServerDataClient(): Promise<{
  supabase: SupabaseClient;
  userId: string;
}> {
  const ctx = await getServerDataClient();
  if (!ctx) throw new Error("No autenticado");
  return ctx;
}
