import { CategoryTable } from "@/components/dashboard/category-table";
import { HeroAvailable } from "@/components/dashboard/hero-available";
import { BiweekCards, KpiCards } from "@/components/dashboard/kpi-cards";
import { RuleChart } from "@/components/dashboard/rule-chart";
import { formatPeriod } from "@/lib/period";
import { getMonthSummary } from "@/lib/queries";
import { resolvePeriod } from "@/lib/search-params";

export default async function DashboardPage({ searchParams }: PageProps<"/">) {
  const period = await resolvePeriod(searchParams);
  const s = await getMonthSummary(period);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <h1 className="sr-only">Resumen de {formatPeriod(period)}</h1>
      <HeroAvailable totals={s.totals} />
      <KpiCards totals={s.totals} />
      <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
        <BiweekCards biweeks={s.byBiweek} />
        <RuleChart byType={s.byType} />
      </div>
      <CategoryTable rows={s.byCategory} />
    </div>
  );
}
