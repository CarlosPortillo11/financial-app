import { and, asc, desc, eq, gte, lt, max } from "drizzle-orm";
import { db } from "@/db";
import { categories, fixedExpenses, incomes, settings, variableExpenses } from "@/db/schema";
import { computeMonth, type MonthData, type MonthSummary } from "./calc";
import { currentPeriod, periodRange } from "./period";

export async function getCategories(onlyActive = false) {
  return db.query.categories.findMany({
    where: onlyActive ? eq(categories.active, true) : undefined,
    orderBy: [asc(categories.type), asc(categories.name)],
  });
}

export async function getSettings() {
  const row = await db.query.settings.findFirst();
  if (row) return row;
  const [created] = await db.insert(settings).values({ id: 1 }).returning();
  return created;
}

/**
 * Al abrir un mes sin gastos fijos (actual o futuro), copia los activos del
 * último mes que sí tenga, en estado pendiente.
 */
export async function ensureFixedForPeriod(period: string) {
  if (period < currentPeriod()) return;
  const existing = await db.query.fixedExpenses.findFirst({
    where: eq(fixedExpenses.period, period),
    columns: { id: true },
  });
  if (existing) return;

  const [{ last }] = await db
    .select({ last: max(fixedExpenses.period) })
    .from(fixedExpenses)
    .where(lt(fixedExpenses.period, period));
  if (!last) return;

  const source = await db.query.fixedExpenses.findMany({
    where: and(eq(fixedExpenses.period, last), eq(fixedExpenses.active, true)),
  });
  if (!source.length) return;

  await db.insert(fixedExpenses).values(
    source.map(({ categoryId, description, amount, biweek, dueDay }) => ({
      categoryId,
      description,
      amount,
      biweek,
      dueDay,
      period,
      status: "pendiente" as const,
      active: true,
    })),
  );
}

export async function getFixedExpenses(period: string) {
  await ensureFixedForPeriod(period);
  return db.query.fixedExpenses.findMany({
    where: eq(fixedExpenses.period, period),
    orderBy: [asc(fixedExpenses.biweek), asc(fixedExpenses.dueDay)],
  });
}

export async function getVariableExpenses(period: string) {
  const { start, end } = periodRange(period);
  return db.query.variableExpenses.findMany({
    where: and(gte(variableExpenses.date, start), lt(variableExpenses.date, end)),
    orderBy: [desc(variableExpenses.date), desc(variableExpenses.id)],
  });
}

export async function getIncomes(period: string) {
  const { start, end } = periodRange(period);
  return db.query.incomes.findMany({
    where: and(gte(incomes.date, start), lt(incomes.date, end)),
    orderBy: [desc(incomes.date), desc(incomes.id)],
  });
}

export async function getMonthData(period: string): Promise<MonthData> {
  const [cats, fixed, variable, inc, sett] = await Promise.all([
    getCategories(),
    getFixedExpenses(period),
    getVariableExpenses(period),
    getIncomes(period),
    getSettings(),
  ]);
  return { categories: cats, fixed, variable, incomes: inc, settings: sett };
}

export async function getMonthSummary(period: string): Promise<MonthSummary> {
  return computeMonth(await getMonthData(period));
}
