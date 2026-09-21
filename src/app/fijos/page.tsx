import { FixedExpenseList } from "@/components/lists/fixed-expense-list";
import { getCards, getCategories, getFixedExpenses, getSettings } from "@/lib/queries";
import { resolvePeriod } from "@/lib/search-params";

export default async function FixedPage({ searchParams }: PageProps<"/fijos">) {
  const period = await resolvePeriod(searchParams);
  const { h } = await searchParams;
  const [rows, categories, cards, settings] = await Promise.all([
    getFixedExpenses(period),
    getCategories(true),
    getCards(),
    getSettings(),
  ]);
  return (
    <FixedExpenseList
      rows={rows}
      categories={categories}
      cards={cards}
      period={period}
      payDays={settings}
      highlightId={typeof h === "string" ? Number(h) : undefined}
    />
  );
}
