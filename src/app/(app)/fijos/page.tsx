import { requireSettings } from "@/lib/session";
import { FixedExpenseList } from "@/components/lists/fixed-expense-list";
import { getCards, getCategories, getFixedExpenses } from "@/lib/queries";
import { resolvePeriod } from "@/lib/search-params";

export default async function FixedPage({ searchParams }: PageProps<"/fijos">) {
  const settings = await requireSettings();
  const period = await resolvePeriod(searchParams, settings);
  const { h } = await searchParams;
  const [rows, categories, cards] = await Promise.all([
    getFixedExpenses(settings, period),
    getCategories(settings.userId, true),
    getCards(settings.userId),
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
