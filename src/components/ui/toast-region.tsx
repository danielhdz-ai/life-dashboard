"use client";

/** Región de toasts (estructura); integración completa en fases posteriores. */
export function ToastRegion() {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-20 right-4 z-[90] flex flex-col gap-2 md:bottom-6"
    />
  );
}
