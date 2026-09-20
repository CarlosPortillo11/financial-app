import { IncomeList } from "@/components/lists/income-list";
import { getIncomes } from "@/lib/queries";
import { resolvePeriod } from "@/lib/search-params";

export default async function IncomePage({ searchParams }: PageProps<"/ingresos">) {
  const period = await resolvePeriod(searchParams);
  const rows = await getIncomes(period);
  return <IncomeList rows={rows} period={period} />;
}
