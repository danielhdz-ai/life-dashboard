import { SourceLogo } from "@/components/dashboard/source-logo";
import { SOURCE_LOGO_ORDER } from "@/lib/sources/logos";

const labels: Record<(typeof SOURCE_LOGO_ORDER)[number], string> = {
  livendia: "Livendia",
  nuevahabitat: "NuevaHabitat",
  firmacert: "FirmaCert",
  "mercat-immobiliari": "Mercat Immobiliari",
  inmonest: "Inmonest",
};

/** Fila de logos en orden fijo (izquierda → derecha). */
export function BusinessLogoStrip() {
  return (
    <div className="flex flex-wrap items-center justify-start gap-4 sm:gap-6">
      {SOURCE_LOGO_ORDER.map((slug) => (
        <div key={slug} className="flex flex-col items-center gap-1.5">
          <SourceLogo slug={slug} name={labels[slug]} size={48} />
          <span className="max-w-[72px] truncate text-center text-[10px] text-[var(--ld-text-muted)]">
            {labels[slug]}
          </span>
        </div>
      ))}
    </div>
  );
}
