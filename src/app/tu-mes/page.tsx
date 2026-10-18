import type { Metadata } from "next";
import { MonthStoryView } from "@/components/story/month-story";
import { computeMonth } from "@/lib/calc";
import { getMonthData } from "@/lib/queries";
import { resolvePeriod } from "@/lib/search-params";
import { requireSettings } from "@/lib/session";
import { buildStory } from "@/lib/story";

export const metadata: Metadata = { title: "Tu mes · Finanzas" };

export default async function MonthStoryPage({ searchParams }: PageProps<"/tu-mes">) {
  const settings = await requireSettings();
  const period = await resolvePeriod(searchParams, settings);
  const data = await getMonthData(settings, period);
  return <MonthStoryView story={buildStory(period, data, computeMonth(data))} currency={settings.currency} />;
}
