/**
 * Design tokens exportados para uso en JS (gráficas, temas dinámicos).
 * Los valores CSS viven en globals.css; mantener sincronizados.
 */
export const colors = {
  bg: {
    deep: "#07070a",
    base: "#0a0a0f",
    elevated: "#0e0e12",
  },
  accent: "#a8b4ff",
  text: {
    primary: "rgba(255, 255, 255, 0.95)",
    secondary: "rgba(255, 255, 255, 0.62)",
    muted: "rgba(255, 255, 255, 0.42)",
  },
  sources: {
    livendia: "#7c9cbf",
    inmonest: "#9b8ec4",
    firmacert: "#7eb8a8",
    mercat: "#c4a87a",
    nuevahabitat: "#b8909e",
  },
} as const;

export const radii = {
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
} as const;

export const glass = {
  blur: "24px",
  background: "rgba(255, 255, 255, 0.06)",
  border: "rgba(255, 255, 255, 0.12)",
} as const;

export const locale = {
  language: "es-ES",
  currency: "EUR",
  timeZone: "Europe/Madrid",
} as const;
