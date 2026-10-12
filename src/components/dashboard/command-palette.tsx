"use client";

import { Command } from "cmdk";
import { Search, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { GlassInput } from "@/components/glass/glass-input";
import { getCommandPages } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pages = useMemo(() => getCommandPages(), []);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? pages.filter((p) => p.label.toLowerCase().includes(q))
      : pages;
    const map = new Map<string, typeof pages>();
    for (const item of filtered) {
      const list = map.get(item.group) ?? [];
      list.push(item);
      map.set(item.group, list);
    }
    return map;
  }, [pages, query]);

  const run = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("life-dashboard:open-command", onOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("life-dashboard:open-command", onOpen);
    };
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 p-4 pt-[12vh] backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Cerrar paleta"
        onClick={() => setOpen(false)}
      />
      <Command
        className="relative z-[1] w-full max-w-xl overflow-hidden rounded-[var(--ld-radius-xl)] border border-[var(--ld-border-default)] bg-[rgba(12,12,18,0.92)] shadow-[var(--ld-shadow-elevated)] backdrop-blur-xl"
        label="Paleta de comandos"
      >
        <div className="flex items-center gap-2 border-b border-[var(--ld-border-subtle)] px-4">
          <Search className="h-4 w-4 text-[var(--ld-text-muted)]" />
          <Command.Input
            asChild
            value={query}
            onValueChange={setQuery}
          >
            <GlassInput
              className="border-0 bg-transparent focus-visible:ring-0"
              placeholder="Ir a…, añadir movimiento o preguntar a la IA"
              autoFocus
            />
          </Command.Input>
          <kbd className="hidden rounded border border-[var(--ld-border-subtle)] px-1.5 py-0.5 text-[10px] text-[var(--ld-text-faint)] sm:inline">
            Esc
          </kbd>
        </div>
        <Command.List className="max-h-[min(420px,50vh)] overflow-y-auto p-2">
          <Command.Empty className="py-8 text-center text-sm text-[var(--ld-text-muted)]">
            Sin resultados
          </Command.Empty>
          {[...grouped.entries()].map(([group, items]) => (
            <Command.Group
              key={group}
              heading={group}
              className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-[var(--ld-text-faint)]"
            >
              {items.map((item) => (
                <Command.Item
                  key={item.id}
                  value={item.label}
                  onSelect={() => run(item.href)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-[var(--ld-radius-md)] px-3 py-2.5 text-sm text-[var(--ld-text-secondary)]",
                    "aria-selected:bg-[var(--ld-bg-glass-strong)] aria-selected:text-[var(--ld-text-primary)]",
                  )}
                >
                  {item.id === "action-ai" ? (
                    <Sparkles className="h-4 w-4 text-[var(--ld-accent)]" />
                  ) : null}
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>
          ))}
        </Command.List>
        <div className="border-t border-[var(--ld-border-subtle)] px-4 py-2 text-[11px] text-[var(--ld-text-faint)]">
          Ctrl+K · Navegación y acciones rápidas (IA en Fase 3)
        </div>
      </Command>
    </div>
  );
}
