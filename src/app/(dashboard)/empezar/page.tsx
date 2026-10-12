import Link from "next/link";
import { redirect } from "next/navigation";

import { GlassButton } from "@/components/glass/glass-button";
import { GlassCard } from "@/components/glass/glass-card";
import { getServerDataClient } from "@/lib/supabase/data-client";

/** Solo lo que Daniel debe hacer a mano (sin terminal). */
export default async function EmpezarPage() {
  const ctx = await getServerDataClient();
  if (!ctx) redirect("/login");

  const googleOk = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const callbackUrl = `${appUrl.replace(/\/$/, "")}/api/oauth/google/callback`;

  return (
    <div className="mx-auto max-w-lg space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-semibold">Solo 2 cosas por tu parte</h1>
        <p className="mt-1 text-sm text-[var(--ld-text-secondary)]">
          El resto (base de datos, usuario, fuentes, Mercat, despliegue) ya lo gestiona el
          proyecto.
        </p>
      </div>

      <GlassCard className="space-y-4 p-6" elevation="raised">
        <p className="text-sm font-medium">1. Google Cloud (una vez)</p>
        <p className="text-sm text-[var(--ld-text-muted)]">
          Crea OAuth Web y pega esta URL de retorno en Google:
        </p>
        <code className="block break-all rounded-md bg-black/30 p-2 text-xs">{callbackUrl}</code>
        <p className="text-xs text-[var(--ld-text-muted)]">
          Luego envíame por un canal seguro el Client ID y el Secret, o pégalos tú en Vercel →
          Environment Variables →{" "}
          <strong>GOOGLE_CLIENT_ID</strong> y <strong>GOOGLE_CLIENT_SECRET</strong>.
        </p>
        <p className="text-xs text-[var(--ld-text-secondary)]">
          Estado: {googleOk ? "✓ Variables detectadas en el servidor" : "○ Faltan variables Google"}
        </p>
      </GlassCard>

      <GlassCard className="space-y-4 p-6">
        <p className="text-sm font-medium">2. Conectar tus Gmails (clic)</p>
        <GlassButton variant="accent" asChild className="w-full">
          <Link href="/ajustes">Ir a Ajustes → Conectar Gmail</Link>
        </GlassButton>
        <p className="text-xs text-[var(--ld-text-muted)]">
          Repite por cada cuenta. Después pulsa Sincronizar y confirma pagos en Avisos.
        </p>
      </GlassCard>

      <GlassButton variant="ghost" asChild className="w-full">
        <Link href="/">Ir al dashboard</Link>
      </GlassButton>
    </div>
  );
}
