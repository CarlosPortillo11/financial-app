import { VariableExpenseList } from "@/components/lists/variable-expense-list";
import { getCards, getCategories, getSettings, getVariableExpenses } from "@/lib/queries";
import { resolvePeriod } from "@/lib/search-params";

export default async function VariablePage({ searchParams }: PageProps<"/variables">) {
  const period = await resolvePeriod(searchParams);
  const [rows, categories, cards, settings] = await Promise.all([
    getVariableExpenses(period),
    getCategories(true),
    getCards(),
    getSettings(),
  ]);
  return (
    <VariableExpenseList
      rows={rows}
      categories={categories}
      cards={cards}
      period={period}
      payDays={settings}
    />
  );
}
