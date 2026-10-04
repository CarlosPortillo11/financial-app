import { requireSettings } from "@/lib/session";
import { IncomeList } from "@/components/lists/income-list";
import { getIncomes } from "@/lib/queries";
import { resolvePeriod } from "@/lib/search-params";

export default async function IncomePage({ searchParams }: PageProps<"/ingresos">) {
  const settings = await requireSettings();
  const period = await resolvePeriod(searchParams, settings);
  const rows = await getIncomes(settings, period);
  return <IncomeList rows={rows} period={period} payDays={settings} />;
}
