import { requireSettings } from "@/lib/session";
import { Alerts, RuleTable, Suggestions } from "@/components/dashboard/advice";
import { PageHeader } from "@/components/shared/page-header";
import { formatPeriod } from "@/lib/period";
import { getMonthData } from "@/lib/queries";
import { computeMonth } from "@/lib/calc";
import { resolvePeriod } from "@/lib/search-params";

export default async function AdvicePage({ searchParams }: PageProps<"/consejos">) {
  const settings = await requireSettings();
  const period = await resolvePeriod(searchParams, settings);
  const data = await getMonthData(settings, period);
  const s = computeMonth(data);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PageHeader title="Consejos" description={formatPeriod(period)} />
      <Alerts alerts={s.alerts} period={period} />
      <RuleTable byType={s.byType} />
      <Suggestions suggestions={s.suggestions} settings={data.settings} />
    </div>
  );
}
