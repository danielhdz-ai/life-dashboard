import Image from "next/image";

import { getSourceLogo } from "@/lib/sources/logos";
import { cn } from "@/lib/utils";

type SourceLogoProps = {
  slug: string;
  name: string;
  size?: number;
  className?: string;
};

export function SourceLogo({ slug, name, size = 40, className }: SourceLogoProps) {
  const src = getSourceLogo(slug);
  if (!src) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-[var(--ld-radius-md)] bg-[var(--ld-bg-surface)] text-[10px] font-semibold text-[var(--ld-text-muted)]",
          className,
        )}
        style={{ width: size, height: size }}
      >
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-[var(--ld-radius-md)] bg-white/95 ring-1 ring-[var(--ld-border-subtle)]",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={`Logo ${name}`}
        fill
        className="object-contain p-1"
        sizes={`${size}px`}
      />
    </div>
  );
}
