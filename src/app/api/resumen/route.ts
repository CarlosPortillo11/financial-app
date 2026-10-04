import { NextResponse } from "next/server";
import { currentPeriod, isPeriod } from "@/lib/period";
import { getMonthSummary, getSettings } from "@/lib/queries";
import { getSession } from "@/lib/session";

/** GET /api/resumen?m=YYYY-MM — mismo cálculo que el dashboard, para exports o clientes externos. */
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Inicia sesión" }, { status: 401 });
  const settings = await getSettings(session.user.id);
  const m = new URL(req.url).searchParams.get("m") ?? currentPeriod(settings);
  if (!isPeriod(m)) {
    return NextResponse.json({ error: "Parámetro m inválido, usa YYYY-MM" }, { status: 400 });
  }
  return NextResponse.json({ period: m, ...(await getMonthSummary(settings, m)) });
}
