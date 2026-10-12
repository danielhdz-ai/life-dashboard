import { cn } from "@/lib/utils";

type ChipProps = {
  children: React.ReactNode;
  color?: string;
  variant?: "solid" | "outline";
  className?: string;
};

export function Chip({
  children,
  color = "var(--ld-accent)",
  variant = "outline",
  className,
}: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        variant === "outline" && "border",
        className,
      )}
      style={{
        borderColor: variant === "outline" ? `${color}55` : undefined,
        backgroundColor: variant === "solid" ? `${color}22` : `${color}12`,
        color: color,
      }}
    >
      {children}
    </span>
  );
}
