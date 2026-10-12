"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

const glassButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--ld-radius-md)] border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ld-accent-muted)] disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        default:
          "border-[var(--ld-border-default)] bg-[var(--ld-bg-glass-strong)] text-[var(--ld-text-primary)] hover:bg-[var(--ld-bg-surface-hover)]",
        ghost:
          "border-transparent bg-transparent text-[var(--ld-text-secondary)] hover:bg-[var(--ld-bg-surface)] hover:text-[var(--ld-text-primary)]",
        accent:
          "border-[var(--ld-accent-muted)] bg-[var(--ld-accent-glow)] text-[var(--ld-text-primary)] hover:border-[var(--ld-accent)]",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-5",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type GlassButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof glassButtonVariants> & {
    asChild?: boolean;
  };

export function GlassButton({
  className,
  variant,
  size,
  asChild,
  children,
  type = "button",
  ...props
}: GlassButtonProps) {
  const reduceMotion = useReducedMotion();
  const classes = cn(glassButtonVariants({ variant, size, className }));

  if (asChild) {
    return <Slot className={classes}>{children}</Slot>;
  }

  return (
    <motion.div
      className="inline-flex"
      whileHover={reduceMotion ? undefined : { scale: 1.02 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      <button type={type} className={classes} {...props}>
        {children}
      </button>
    </motion.div>
  );
}
