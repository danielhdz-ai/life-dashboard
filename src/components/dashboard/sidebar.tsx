"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CircleDollarSign, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { SourceLogo } from "@/components/dashboard/source-logo";
import { GlassButton } from "@/components/glass/glass-button";
import { dashboardNav, incomeSourceNav } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <>
      <motion.aside
        layout={!reduceMotion}
        className={cn(
          "fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-[var(--ld-border-subtle)] bg-[rgba(8,8,12,0.72)] backdrop-blur-xl md:flex",
          collapsed ? "w-[72px]" : "w-[260px]",
        )}
        transition={{ type: "spring", stiffness: 420, damping: 36 }}
      >
        <div className="flex h-16 items-center gap-3 border-b border-[var(--ld-border-subtle)] px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--ld-radius-md)] border border-[var(--ld-border-default)] bg-[var(--ld-bg-glass)]">
            <CircleDollarSign className="h-4 w-4 text-[var(--ld-accent)]" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="min-w-0"
              >
                <p className="truncate text-sm font-semibold">Life Dashboard</p>
                <p className="truncate text-[11px] text-[var(--ld-text-muted)]">
                  Daniel Hernández
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto p-3">
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-2 pb-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--ld-text-faint)]">
                General
              </p>
            )}
            {dashboardNav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-[var(--ld-radius-md)] px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-[var(--ld-bg-glass-strong)] text-[var(--ld-text-primary)]"
                      : "text-[var(--ld-text-secondary)] hover:bg-[var(--ld-bg-surface)] hover:text-[var(--ld-text-primary)]",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-80 group-hover:opacity-100" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>

          <div className="space-y-1">
            {!collapsed && (
              <p className="px-2 pb-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--ld-text-faint)]">
                Negocios
              </p>
            )}
            {incomeSourceNav.map((source) => {
              const href = `/fuentes/${source.slug}`;
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={source.slug}
                  href={href}
                  title={collapsed ? source.label : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-[var(--ld-radius-md)] px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-[var(--ld-bg-surface)] text-[var(--ld-text-primary)]"
                      : "text-[var(--ld-text-muted)] hover:bg-[var(--ld-bg-surface)] hover:text-[var(--ld-text-secondary)]",
                  )}
                >
                  <SourceLogo slug={source.slug} name={source.label} size={collapsed ? 28 : 24} />
                  {!collapsed && <span className="truncate">{source.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-[var(--ld-border-subtle)] p-3">
          <GlassButton
            variant="ghost"
            size={collapsed ? "icon" : "default"}
            className={cn("w-full", collapsed && "px-0")}
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4" />
                <span>Contraer</span>
              </>
            )}
          </GlassButton>
        </div>
      </motion.aside>

      <MobileNav pathname={pathname} />
    </>
  );
}

export function SidebarFallback() {
  return (
    <>
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[260px] border-r border-[var(--ld-border-subtle)] bg-[rgba(8,8,12,0.72)] backdrop-blur-xl md:flex" />
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-14 border-t border-[var(--ld-border-subtle)] bg-[rgba(8,8,12,0.88)] md:hidden" />
    </>
  );
}

function MobileNav({ pathname }: { pathname: string }) {
  const items = dashboardNav.slice(0, 5);
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-[var(--ld-border-subtle)] bg-[rgba(8,8,12,0.88)] backdrop-blur-xl md:hidden">
      {items.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-[10px]",
              active ? "text-[var(--ld-accent)]" : "text-[var(--ld-text-muted)]",
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label.split(" ")[0]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
