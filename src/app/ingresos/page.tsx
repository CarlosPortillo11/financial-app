import { IncomeList } from "@/components/lists/income-list";
import { getIncomes, getSettings } from "@/lib/queries";
import { resolvePeriod } from "@/lib/search-params";

export default async function IncomePage({ searchParams }: PageProps<"/ingresos">) {
  const period = await resolvePeriod(searchParams);
  const [rows, settings] = await Promise.all([getIncomes(period), getSettings()]);
  return <IncomeList rows={rows} period={period} payDays={settings} />;
}
