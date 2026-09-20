import { FixedExpenseList } from "@/components/lists/fixed-expense-list";
import { getCategories, getFixedExpenses } from "@/lib/queries";
import { resolvePeriod } from "@/lib/search-params";

export default async function FixedPage({ searchParams }: PageProps<"/fijos">) {
  const period = await resolvePeriod(searchParams);
  const { h } = await searchParams;
  const [rows, categories] = await Promise.all([getFixedExpenses(period), getCategories(true)]);
  return (
    <FixedExpenseList
      rows={rows}
      categories={categories}
      period={period}
      highlightId={typeof h === "string" ? Number(h) : undefined}
    />
  );
}
