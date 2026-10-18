import type { Biweek } from "./period";
import type { MonthData, MonthSummary } from "./calc";

export type MonthStory = {
  period: string;
  income: number;
  incomeCount: number;
  carryOver: number;
  spent: number;
  spentRatio: number;
  moves: number;
  top: { emoji: string; name: string; total: number; ratio: number } | null;
  biggest: { emoji: string; label: string; amount: number; date: string } | null;
  rule: { label: string; targetPct: number; actualPct: number; bad: boolean; message: string }[];
  biweeks: { biweek: Biweek; range: string; spent: number }[];
  calmest: Biweek | null;
  available: number;
  savedRatio: number;
};

export function buildStory(period: string, data: MonthData, s: MonthSummary): MonthStory {
  const { income, spent, available, carryOver } = s.totals;
  const top = s.byCategory[0];
  const biggest = data.variable.reduce<MonthData["variable"][number] | null>(
    (max, v) => (!max || v.amount > max.amount ? v : max),
    null,
  );
  const biggestCat = biggest && data.categories.find((c) => c.id === biggest.categoryId);
  const [q1, q2] = s.byBiweek;

  return {
    period,
    income,
    incomeCount: data.incomes.length,
    carryOver,
    spent,
    spentRatio: income > 0 ? spent / income : 0,
    moves: data.fixed.length + data.variable.length,
    top: top
      ? { emoji: top.category.emoji, name: top.category.name, total: top.total, ratio: top.pctOfSpent }
      : null,
    biggest: biggest
      ? {
          emoji: biggestCat?.emoji ?? "•",
          label: biggest.description || biggestCat?.name || "Gasto",
          amount: biggest.amount,
          date: biggest.date,
        }
      : null,
    rule: s.byType.map((t) => ({
      label: t.label,
      targetPct: t.targetPct,
      actualPct: Math.round(t.actualPct * 100),
      bad: t.bad,
      message: t.message,
    })),
    biweeks: s.byBiweek.map((q) => ({ biweek: q.biweek, range: q.range, spent: q.spent })),
    calmest: q1.spent === q2.spent ? null : q1.spent < q2.spent ? 1 : 2,
    available,
    savedRatio: s.byType.find((t) => t.type === "ahorro_inversion")!.actualPct,
  };
}
