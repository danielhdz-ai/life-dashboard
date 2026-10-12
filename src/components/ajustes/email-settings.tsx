"use client";

import { Mail, RefreshCw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { disconnectEmailAccount } from "@/lib/actions/alerts";
import type { EmailAccountSummary } from "@/lib/ajustes/email-accounts";
import { GlassButton } from "@/components/glass/glass-button";
import { GlassCard } from "@/components/glass/glass-card";

type Props = {
  accounts: EmailAccountSummary[];
  googleConfigured: boolean;
};

export function EmailSettings({ accounts, googleConfigured }: Props) {
  const params = useSearchParams();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [syncing, setSyncing] = useState(false);

  const connected = params.get("connected") === "1";
  const error = params.get("error");

  async function syncNow() {
    setSyncing(true);
    try {
      await fetch("/api/email/sync", { method: "POST" });
      router.refresh();
    } finally {
      setSyncing(false);
    }
  }

  return (
    <GlassCard className="p-6" elevation="raised">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium">Gmail (solo lectura)</h2>
          <p className="mt-1 text-sm text-[var(--ld-text-muted)]">
            Conecta todas tus cuentas Google. Detectamos pagos por reglas; tú confirmas antes de
            registrarlos. Permiso: <code className="text-xs">gmail.readonly</code>.
          </p>
        </div>
        <Mail className="h-5 w-5 text-[var(--ld-accent)]" />
      </div>

      {connected && (
        <p className="mt-3 text-sm text-[var(--ld-success)]">Cuenta conectada correctamente.</p>
      )}
      {error && (
        <p className="mt-3 text-sm text-[var(--ld-danger)]">
          Error al conectar ({error}). Revisa OAuth en Google Cloud y variables en Vercel.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <GlassButton variant="accent" disabled={!googleConfigured} asChild>
          <a href="/api/oauth/google">Conectar otra cuenta Gmail</a>
        </GlassButton>
        <GlassButton variant="ghost" disabled={syncing || !accounts.length} onClick={syncNow}>
          <RefreshCw className={syncing ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          Sincronizar ahora
        </GlassButton>
      </div>

      {!googleConfigured && (
        <p className="mt-3 text-xs text-[var(--ld-warning)]">
          Configura GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en `.env.local` / Vercel.
        </p>
      )}

      <ul className="mt-6 space-y-3">
        {accounts.length === 0 && (
          <li className="text-sm text-[var(--ld-text-muted)]">Ninguna cuenta conectada aún.</li>
        )}
        {accounts.map((a) => (
          <li
            key={a.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--ld-radius-md)] border border-[var(--ld-border-subtle)] px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium">{a.email_address}</p>
              <p className="text-xs text-[var(--ld-text-muted)]">
                {a.last_sync_at
                  ? `Última sync: ${new Date(a.last_sync_at).toLocaleString("es-ES")}`
                  : "Sin sincronizar"}
                {a.sync_error ? ` · Error: ${a.sync_error}` : ""}
              </p>
            </div>
            <GlassButton
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await disconnectEmailAccount(a.id);
                  router.refresh();
                })
              }
            >
              Desconectar
            </GlassButton>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
