import { CategoryTable } from "@/components/dashboard/category-table";
import { HeroAvailable } from "@/components/dashboard/hero-available";
import { DashboardBento } from "@/components/dashboard/kpi-cards";
import { RuleChart } from "@/components/dashboard/rule-chart";
import { computeMonth, dailyAllowance } from "@/lib/calc";
import { currentPeriod, formatPeriod, today } from "@/lib/period";
import { getMonthData } from "@/lib/queries";
import { resolvePeriod } from "@/lib/search-params";
import { requireSettings } from "@/lib/session";

export default async function DashboardPage({ searchParams }: PageProps<"/">) {
  const settings = await requireSettings();
  const period = await resolvePeriod(searchParams, settings);
  const data = await getMonthData(settings, period);
  const s = computeMonth(data);
  const daily = period === currentPeriod(settings) ? dailyAllowance(s, settings, today(settings.timeZone)) : null;

  return (
    <div className="flex flex-col gap-7 md:gap-9">
      <h1 className="sr-only">Resumen de {formatPeriod(period)}</h1>
      <HeroAvailable totals={s.totals} daily={daily} />
      <DashboardBento totals={s.totals} biweeks={s.byBiweek} />
      <RuleChart byType={s.byType} />
      <CategoryTable rows={s.byCategory} />
    </div>
  );
}
