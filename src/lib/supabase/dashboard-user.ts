import { createAdminClient } from "@/lib/supabase/admin";
import { isOpenDashboard } from "@/lib/auth/open-dashboard";
import { getAllowedEmail } from "@/lib/auth/allowlist";
import { createClient } from "@/lib/supabase/server";

export type DashboardUser = {
  id: string;
  email: string | null;
};

export async function getDashboardUser(): Promise<DashboardUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return { id: user.id, email: user.email ?? null };
  }

  if (!isOpenDashboard()) return null;

  const allowed = getAllowedEmail();
  if (!allowed) return null;

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (error) return null;

  const owner = data.users.find((u) => u.email?.toLowerCase() === allowed);
  if (!owner) return null;

  return { id: owner.id, email: owner.email ?? null };
}
