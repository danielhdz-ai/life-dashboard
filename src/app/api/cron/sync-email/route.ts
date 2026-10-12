import { NextResponse } from "next/server";

/** Stub — implementación en Fase 4 (protegido con CRON_SECRET). */
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, message: "Cron stub (Fase 4)" });
}
