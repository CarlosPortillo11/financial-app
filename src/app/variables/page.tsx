import { VariableExpenseList } from "@/components/lists/variable-expense-list";
import { getCategories, getSettings, getVariableExpenses } from "@/lib/queries";
import { resolvePeriod } from "@/lib/search-params";

export default async function VariablePage({ searchParams }: PageProps<"/variables">) {
  const period = await resolvePeriod(searchParams);
  const [rows, categories, settings] = await Promise.all([
    getVariableExpenses(period),
    getCategories(true),
    getSettings(),
  ]);
  return (
    <VariableExpenseList rows={rows} categories={categories} period={period} payDays={settings} />
  );
}
