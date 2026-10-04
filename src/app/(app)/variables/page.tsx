import { requireSettings } from "@/lib/session";
import { VariableExpenseList } from "@/components/lists/variable-expense-list";
import { getCards, getCategories, getVariableExpenses } from "@/lib/queries";
import { resolvePeriod } from "@/lib/search-params";

export default async function VariablePage({ searchParams }: PageProps<"/variables">) {
  const settings = await requireSettings();
  const period = await resolvePeriod(searchParams, settings);
  const [rows, categories, cards] = await Promise.all([
    getVariableExpenses(settings, period),
    getCategories(settings.userId, true),
    getCards(settings.userId),
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
