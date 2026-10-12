"use client";

import { Eye, EyeOff } from "lucide-react";
import { useEffect } from "react";

import { usePrivacyMode } from "@/components/providers/privacy-provider";
import { GlassButton } from "@/components/glass/glass-button";

export function PrivacyToggle() {
  const { enabled, toggle } = usePrivacyMode();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "h" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle]);

  return (
    <GlassButton
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? "Mostrar importes" : "Ocultar importes (modo privacidad)"}
      title="Modo privacidad (Ctrl+Shift+H)"
    >
      {enabled ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </GlassButton>
  );
}
