import { cn } from "@/lib/utils";

export function GlassInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-[var(--ld-radius-md)] border border-[var(--ld-border-subtle)] bg-[var(--ld-bg-surface)] px-3 text-sm text-[var(--ld-text-primary)] placeholder:text-[var(--ld-text-faint)] backdrop-blur-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ld-accent-muted)]",
        className,
      )}
      {...props}
    />
  );
}
