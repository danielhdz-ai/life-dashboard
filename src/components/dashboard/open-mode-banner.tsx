import { isOpenDashboard } from "@/lib/auth/open-dashboard";

export function OpenModeBanner() {
  if (!isOpenDashboard()) return null;

  return (
    <div className="border-b border-[var(--ld-warning)]/30 bg-[var(--ld-warning)]/10 px-4 py-2 text-center text-xs text-[var(--ld-warning)]">
      Modo abierto (temporal): sin login. No compartas esta URL. Desactiva con{" "}
      <code className="text-[10px]">OPEN_DASHBOARD=false</code> en Vercel.
    </div>
  );
}
