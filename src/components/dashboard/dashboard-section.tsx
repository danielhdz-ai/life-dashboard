import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
};

export function DashboardSection({ title, subtitle, children, className }: Props) {
  return (
    <section className={cn("space-y-4", className)}>
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-sm text-[var(--ld-text-muted)]">{subtitle}</p>
        )}
      </div>
      {children}
    </section>
  );
}
