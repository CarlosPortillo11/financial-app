import { NextResponse } from "next/server";
import { currentPeriod, isPeriod } from "@/lib/period";
import { getMonthSummary } from "@/lib/queries";

/** GET /api/resumen?m=YYYY-MM — mismo cálculo que el dashboard, para exports o clientes externos. */
export async function GET(req: Request) {
  const m = new URL(req.url).searchParams.get("m") ?? currentPeriod();
  if (!isPeriod(m)) {
    return NextResponse.json({ error: "Parámetro m inválido, usa YYYY-MM" }, { status: 400 });
  }
  return NextResponse.json({ period: m, ...(await getMonthSummary(m)) });
}
