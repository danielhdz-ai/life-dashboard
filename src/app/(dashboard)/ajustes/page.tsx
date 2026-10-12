import { Suspense } from "react";
import { redirect } from "next/navigation";

import { EmailSettings } from "@/components/ajustes/email-settings";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { GlassCard } from "@/components/glass/glass-card";
import { listEmailAccountsForUser } from "@/lib/ajustes/email-accounts";
import { createClient } from "@/lib/supabase/server";

export default async function AjustesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const accounts = await listEmailAccountsForUser(user.id);
  const googleConfigured = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <DashboardSection
        title="Ajustes"
        subtitle="Correo, fuentes, objetivos e integraciones"
      >
        <Suspense
          fallback={
            <GlassCard className="h-40 animate-pulse p-6" spotlight={false}>
              <span className="sr-only">Cargando…</span>
            </GlassCard>
          }
        >
          <EmailSettings accounts={accounts} googleConfigured={googleConfigured} />
        </Suspense>
      </DashboardSection>

      <GlassCard className="p-6" spotlight={false}>
        <h3 className="font-medium">Origen de los datos</h3>
        <p className="mt-2 text-sm text-[var(--ld-text-secondary)]">
          Ver <code className="text-xs">docs/DATA_SOURCES.md</code> en el repo: Supabase es la
          fuente de verdad; Gmail alimenta avisos; Stripe (opcional) solo para FirmaCert; no
          scrapeamos dashboards web.
        </p>
      </GlassCard>
    </div>
  );
}
