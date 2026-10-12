"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { GlassButton } from "@/components/glass/glass-button";
import { GlassInput } from "@/components/glass/glass-input";
import { createClient } from "@/lib/supabase/client";

type Step = "credentials" | "mfa";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = useState<Step>(params.get("mfa") ? "mfa" : "credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    params.get("error") === "not_allowed"
      ? "Este correo no está autorizado."
      : params.get("error")
        ? "No se pudo iniciar sesión."
        : null,
  );
  const [loading, setLoading] = useState(false);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
      const { data: factors, error: factorsError } =
        await supabase.auth.mfa.listFactors();
      if (factorsError || !factors.totp.length) {
        setError(
          "Debes activar 2FA (TOTP) en Supabase Auth antes de continuar.",
        );
        setLoading(false);
        return;
      }
      setFactorId(factors.totp[0].id);
      setStep("mfa");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  async function handleMfa(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { data: challenge, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId });
    if (challengeError || !challenge) {
      setError(challengeError?.message ?? "Error al verificar 2FA");
      setLoading(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: totp,
    });

    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-[var(--ld-radius-md)] border border-[var(--ld-danger)]/40 bg-[var(--ld-danger)]/10 px-3 py-2 text-sm text-[var(--ld-danger)]">
          {error}
        </p>
      )}

      {step === "credentials" ? (
        <form onSubmit={handleCredentials} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-[var(--ld-text-muted)]">
              Correo
            </label>
            <GlassInput
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[var(--ld-text-muted)]">
              Contraseña
            </label>
            <GlassInput
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <GlassButton type="submit" variant="accent" className="w-full" disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </GlassButton>
        </form>
      ) : (
        <form onSubmit={handleMfa} className="space-y-3">
          <p className="text-sm text-[var(--ld-text-secondary)]">
            Introduce el código de tu app de autenticación (2FA).
          </p>
          <GlassInput
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            required
            value={totp}
            onChange={(e) => setTotp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          />
          <GlassButton type="submit" variant="accent" className="w-full" disabled={loading}>
            {loading ? "Verificando…" : "Verificar 2FA"}
          </GlassButton>
        </form>
      )}
    </div>
  );
}
