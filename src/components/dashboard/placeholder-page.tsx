import { GlassCard } from "@/components/glass/glass-card";

export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-[var(--ld-text-secondary)]">{description}</p>
      </div>
      <GlassCard className="p-8" spotlight={false}>
        <p className="text-sm text-[var(--ld-text-muted)]">
          Contenido en desarrollo según el plan por fases del README.
        </p>
      </GlassCard>
    </div>
  );
}
