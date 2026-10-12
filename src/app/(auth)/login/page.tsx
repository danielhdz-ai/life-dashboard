import { Suspense } from "react";

import { AmbientBackground } from "@/components/dashboard/ambient-background";
import { LoginForm } from "@/components/auth/login-form";
import { GlassCard } from "@/components/glass/glass-card";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-6">
      <AmbientBackground />
      <GlassCard className="relative z-10 w-full max-w-md p-8" elevation="raised">
        <h1 className="text-xl font-semibold">Life Dashboard</h1>
        <p className="mt-2 text-sm text-[var(--ld-text-secondary)]">
          Acceso privado — lista blanca y 2FA obligatorio.
        </p>
        <div className="mt-6">
          <Suspense fallback={<p className="text-sm text-[var(--ld-text-muted)]">Cargando…</p>}>
            <LoginForm />
          </Suspense>
        </div>
      </GlassCard>
    </div>
  );
}
