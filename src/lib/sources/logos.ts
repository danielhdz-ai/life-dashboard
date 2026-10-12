/** Orden UI: Livendia → NuevaHabitat → FirmaCert → Mercat → Inmonest (izq. a dcha.) */
export const SOURCE_LOGO_ORDER = [
  "livendia",
  "nuevahabitat",
  "firmacert",
  "mercat-immobiliari",
  "inmonest",
] as const;

export type SourceLogoSlug = (typeof SOURCE_LOGO_ORDER)[number];

export const sourceLogoBySlug: Record<SourceLogoSlug, string> = {
  livendia: "/logos/livendia.jpg",
  nuevahabitat: "/logos/nuevahabitat.png",
  firmacert: "/logos/firmacert.png",
  "mercat-immobiliari": "/logos/mercat-immobiliari.png",
  inmonest: "/logos/inmonest.png",
};

export function getSourceLogo(slug: string): string | undefined {
  return sourceLogoBySlug[slug as SourceLogoSlug];
}

export function sortBusinessesByLogoOrder<T extends { slug: string }>(items: T[]): T[] {
  const order = new Map(SOURCE_LOGO_ORDER.map((s, i) => [s, i]));
  return [...items].sort(
    (a, b) => (order.get(a.slug as SourceLogoSlug) ?? 99) - (order.get(b.slug as SourceLogoSlug) ?? 99),
  );
}
