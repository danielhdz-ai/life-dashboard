"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { SourceLogo } from "@/components/dashboard/source-logo";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { GlassButton } from "@/components/glass/glass-button";
import { GlassCard } from "@/components/glass/glass-card";
import { confirmPaymentAlert, discardPaymentAlert } from "@/lib/actions/alerts";
import { formatCurrency } from "@/lib/format";

type AlertRow = Record<string, unknown>;

export function AvisosView({ alerts }: { alerts: AlertRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const pendingAlerts = alerts.filter((a) => a.status === "por_revisar");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <DashboardSection
        title="Avisos de pago"
        subtitle="Detecciones desde Gmail — confirma para crear ingreso/gasto en el calendario"
      >
      <GlassCard className="overflow-hidden p-0">
        {pendingAlerts.length === 0 ? (
          <p className="p-8 text-center text-sm text-[var(--ld-text-muted)]">
            No hay avisos pendientes. Conecta Gmail en Ajustes y pulsa Sincronizar.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--ld-border-subtle)]">
            {pendingAlerts.map((a) => {
              const src = a.income_sources as { name?: string; slug?: string } | null;
              const meta = a.email_messages_meta as {
                subject?: string;
                from_address?: string;
              } | null;
              const slug = src?.slug ?? "livendia";
              return (
                <li key={String(a.id)} className="flex flex-wrap items-center gap-4 p-5">
                  <SourceLogo slug={slug} name={src?.name ?? "Negocio"} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{meta?.subject ?? String(a.concept ?? "Pago detectado")}</p>
                    <p className="text-xs text-[var(--ld-text-muted)]">{meta?.from_address}</p>
                    <p className="mt-1 text-sm capitalize text-[var(--ld-text-secondary)]">
                      {String(a.detected_type)} · confianza {Number(a.confidence).toFixed(0)} %
                    </p>
                  </div>
                  <p className="ld-sensitive text-lg font-semibold tabular-nums">
                    {a.amount != null ? formatCurrency(Number(a.amount)) : "—"}
                  </p>
                  <div className="flex gap-2">
                    <GlassButton
                      variant="accent"
                      size="sm"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          await confirmPaymentAlert(String(a.id));
                          router.refresh();
                        })
                      }
                    >
                      Confirmar
                    </GlassButton>
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          await discardPaymentAlert(String(a.id));
                          router.refresh();
                        })
                      }
                    >
                      Descartar
                    </GlassButton>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </GlassCard>
      </DashboardSection>
    </div>
  );
}
