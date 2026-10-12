"use client";

import { Suspense } from "react";
import { Search } from "lucide-react";

import { AmbientBackground } from "@/components/dashboard/ambient-background";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { PrivacyToggle } from "@/components/dashboard/privacy-toggle";
import { Sidebar, SidebarFallback } from "@/components/dashboard/sidebar";
import { GlassButton } from "@/components/glass/glass-button";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen text-[var(--ld-text-primary)]">
      <AmbientBackground />
      <Suspense fallback={<SidebarFallback />}>
        <Sidebar />
      </Suspense>
      <div className="relative z-10 md:pl-[260px]">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-end gap-2 border-b border-[var(--ld-border-subtle)] bg-[rgba(8,8,12,0.55)] px-4 backdrop-blur-xl md:px-8">
          <GlassButton
            variant="ghost"
            size="sm"
            className="hidden text-[var(--ld-text-muted)] sm:inline-flex"
            onClick={() => window.dispatchEvent(new Event("life-dashboard:open-command"))}
          >
            <Search className="h-4 w-4" />
            Buscar
            <kbd className="ml-1 rounded border border-[var(--ld-border-subtle)] px-1 text-[10px]">
              Ctrl K
            </kbd>
          </GlassButton>
          <PrivacyToggle />
        </header>
        <main className="px-4 pb-24 pt-6 md:px-8 md:pb-10">{children}</main>
      </div>
      <CommandPalette />
    </div>
  );
}
