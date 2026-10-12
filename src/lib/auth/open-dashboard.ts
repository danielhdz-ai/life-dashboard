/** Modo temporal: dashboard sin login (solo uso personal; activar/desactivar por env). */
export function isOpenDashboard(): boolean {
  return (
    process.env.OPEN_DASHBOARD === "true" ||
    process.env.NEXT_PUBLIC_OPEN_DASHBOARD === "true"
  );
}
