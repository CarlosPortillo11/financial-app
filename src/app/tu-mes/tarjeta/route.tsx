import type { NextRequest } from "next/server";
import { shareCard } from "@/components/story/share-card";
import { computeMonth } from "@/lib/calc";
import { currentPeriod, isPeriod } from "@/lib/period";
import { getMonthData } from "@/lib/queries";
import { requireSettings } from "@/lib/session";
import { buildStory } from "@/lib/story";

export async function GET(request: NextRequest) {
  const settings = await requireSettings();
  const m = request.nextUrl.searchParams.get("m");
  const period = isPeriod(m) ? m : currentPeriod(settings);
  const data = await getMonthData(settings, period);
  return shareCard(buildStory(period, data, computeMonth(data)), settings.currency);
}
