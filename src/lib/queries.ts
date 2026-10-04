import { and, asc, desc, eq, gte, inArray, isNotNull, isNull, lt, lte, max, sql, type SQLWrapper } from "drizzle-orm";
import { db } from "@/db";
import {
  cardPayments,
  cards,
  categories,
  fixedExpenses,
  incomes,
  savingsGoals,
  seededPeriods,
  settings,
  variableExpenses,
  type Category,
  type FixedExpense,
  type SavingsGoal,
  type Settings,
} from "@/db/schema";
import { ALERT_DAYS, computeStatement, daysBetween, type CardStatement } from "./cards";
import { computeMonth, type MonthData, type MonthSummary } from "./calc";
import {
  currentPeriod,
  dueDate,
  monthsBetween,
  periodOf,
  periodRange,
  shiftDate,
  shiftPeriod,
  today,
} from "./period";
import { round2 } from "./money";

export async function getCategories(userId: string, onlyActive = false) {
  return db.query.categories.findMany({
    where: and(eq(categories.userId, userId), onlyActive ? eq(categories.active, true) : undefined),
    orderBy: [asc(categories.type), asc(categories.name)],
  });
}

export async function getSettings(userId: string): Promise<Settings> {
  const row = await db.query.settings.findFirst({ where: eq(settings.userId, userId) });
  if (row) return row;
  await db.insert(settings).values({ userId }).onConflictDoNothing();
  return (await db.query.settings.findFirst({ where: eq(settings.userId, userId) }))!;
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function ensurePeriodSeeded(s: Settings, period: string) {
  if (period < currentPeriod(s)) return;
  await db.transaction(async (tx) => {
    const claimed = await tx
      .insert(seededPeriods)
      .values({ userId: s.userId, period })
      .onConflictDoNothing()
      .returning();
    if (!claimed.length) return;
    await Promise.all([seedFixed(tx, s.userId, period), seedIncomes(tx, s, period)]);
  });
}

async function seedFixed(tx: Tx, userId: string, period: string) {
  const mine = eq(fixedExpenses.userId, userId);
  const [{ last }] = await tx
    .select({ last: max(fixedExpenses.period) })
    .from(fixedExpenses)
    .where(and(mine, lt(fixedExpenses.period, period)));
  if (!last) return;

  const [source, existing] = await Promise.all([
    tx.query.fixedExpenses.findMany({
      where: and(mine, eq(fixedExpenses.period, last), eq(fixedExpenses.active, true)),
    }),
    tx.query.fixedExpenses.findMany({
      where: and(mine, eq(fixedExpenses.period, period)),
      columns: { categoryId: true, description: true },
    }),
  ]);
  const key = (f: { categoryId: number; description: string }) => `${f.categoryId}|${f.description}`;
  const taken = new Set(existing.map(key));
  const missing = source.filter((f) => !taken.has(key(f)));
  if (!missing.length) return;

  await tx.insert(fixedExpenses).values(
    missing.map(({ categoryId, cardId, description, amount, biweek, dueDay }) => ({
      userId,
      categoryId,
      cardId,
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

async function seedIncomes(tx: Tx, s: Settings, period: string) {
  const mine = eq(incomes.userId, s.userId);
  const { start, end } = periodRange(period, s);
  const [{ last }] = await tx
    .select({ last: max(incomes.date) })
    .from(incomes)
    .where(and(mine, eq(incomes.recurring, true), lt(incomes.date, start)));
  if (!last) return;

  const from = periodOf(last, s);
  const fromRange = periodRange(from, s);
  const [source, existing] = await Promise.all([
    tx.query.incomes.findMany({
      where: and(
        mine,
        eq(incomes.recurring, true),
        gte(incomes.date, fromRange.start),
        lt(incomes.date, fromRange.end),
      ),
    }),
    tx.query.incomes.findMany({
      where: and(mine, gte(incomes.date, start), lt(incomes.date, end)),
      columns: { source: true, date: true },
    }),
  ]);
  const months = monthsBetween(from, period);
  const key = (i: { source: string; date: string }) => `${i.source}|${i.date}`;
  const taken = new Set(existing.map(key));
  const copies = source
    .map(({ source, type, amount, date }) => ({
      userId: s.userId,
      source,
      type,
      amount,
      date: shiftDate(date, months),
      recurring: true,
    }))
    .filter((i) => !taken.has(key(i)));
  if (copies.length) await tx.insert(incomes).values(copies);
}

export async function getFixedExpenses(s: Settings, period: string) {
  await ensurePeriodSeeded(s, period);
  return db.query.fixedExpenses.findMany({
    where: and(eq(fixedExpenses.userId, s.userId), eq(fixedExpenses.period, period)),
    orderBy: [asc(fixedExpenses.biweek), asc(fixedExpenses.dueDay)],
  });
}

export async function getVariableExpenses(s: Settings, period: string) {
  const { start, end } = periodRange(period, s);
  return db.query.variableExpenses.findMany({
    where: and(
      eq(variableExpenses.userId, s.userId),
      gte(variableExpenses.date, start),
      lt(variableExpenses.date, end),
    ),
    orderBy: [desc(variableExpenses.date), desc(variableExpenses.id)],
  });
}

export async function getIncomes(s: Settings, period: string) {
  await ensurePeriodSeeded(s, period);
  const { start, end } = periodRange(period, s);
  return db.query.incomes.findMany({
    where: and(eq(incomes.userId, s.userId), gte(incomes.date, start), lt(incomes.date, end)),
    orderBy: [desc(incomes.date), desc(incomes.id)],
  });
}

async function getCarryOver(s: Settings, period: string): Promise<number> {
  if (!s.carryBalance) return 0;
  const { start } = periodRange(period, s);
  const total = (col: SQLWrapper) => sql<number>`coalesce(sum(${col}), 0)::float`;
  const [[inc], [vari], [fix]] = await Promise.all([
    db
      .select({ n: total(incomes.amount) })
      .from(incomes)
      .where(and(eq(incomes.userId, s.userId), lt(incomes.date, start))),
    db
      .select({ n: total(variableExpenses.amount) })
      .from(variableExpenses)
      .where(and(eq(variableExpenses.userId, s.userId), lt(variableExpenses.date, start))),
    db
      .select({ n: total(fixedExpenses.amount) })
      .from(fixedExpenses)
      .where(and(eq(fixedExpenses.userId, s.userId), lt(fixedExpenses.period, period))),
  ]);
  return round2(inc.n - vari.n - fix.n);
}

export async function getMonthData(s: Settings, period: string): Promise<MonthData> {
  const [cats, fixed, variable, inc, carryOver] = await Promise.all([
    getCategories(s.userId),
    getFixedExpenses(s, period),
    getVariableExpenses(s, period),
    getIncomes(s, period),
    getCarryOver(s, period),
  ]);
  return { categories: cats, fixed, variable, incomes: inc, settings: s, carryOver };
}

export async function getMonthSummary(s: Settings, period: string): Promise<MonthSummary> {
  return computeMonth(await getMonthData(s, period));
}

export async function getCards(userId: string) {
  return db.query.cards.findMany({
    where: eq(cards.userId, userId),
    orderBy: [asc(cards.name)],
  });
}

/** Estado de cuenta por tarjeta: cerrado (por pagar) y abierto (acumulando). */
export async function getCardStatements(s: Settings): Promise<CardStatement[]> {
  const list = await getCards(s.userId);
  if (!list.length) return [];
  const [vari, fixed, payments] = await Promise.all([
    db.query.variableExpenses.findMany({
      where: and(eq(variableExpenses.userId, s.userId), isNotNull(variableExpenses.cardId)),
      columns: { cardId: true, amount: true, date: true },
    }),
    db.query.fixedExpenses.findMany({
      where: and(eq(fixedExpenses.userId, s.userId), isNotNull(fixedExpenses.cardId)),
      columns: { cardId: true, amount: true, period: true, dueDay: true },
    }),
    db.query.cardPayments.findMany({
      where: eq(cardPayments.userId, s.userId),
      columns: { id: true, cardId: true, amount: true, date: true },
    }),
  ]);
  const charges = [
    ...vari,
    ...fixed.map((f) => ({
      cardId: f.cardId,
      amount: f.amount,
      date: dueDate(f.period, f.dueDay, s),
    })),
  ];
  const now = today(s.timeZone);
  return list.map((c) => computeStatement(c, charges, payments, now));
}

export type DueFixed = { expense: FixedExpense; dueAt: string; daysLeft: number };

export async function getDueFixed(s: Settings): Promise<DueFixed[]> {
  const period = currentPeriod(s);
  const now = today(s.timeZone);
  const rows = await db.query.fixedExpenses.findMany({
    where: and(
      eq(fixedExpenses.userId, s.userId),
      eq(fixedExpenses.status, "pendiente"),
      isNull(fixedExpenses.cardId),
      inArray(fixedExpenses.period, [shiftPeriod(period, -1), period]),
    ),
  });
  return rows
    .map((expense) => {
      const dueAt = dueDate(expense.period, expense.dueDay, s);
      return { expense, dueAt, daysLeft: daysBetween(now, dueAt) };
    })
    .filter((d) => d.daysLeft <= ALERT_DAYS)
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

export type GoalProgress = { goal: SavingsGoal; category: Category; saved: number; monthly: number | null };

export async function getGoals(s: Settings): Promise<GoalProgress[]> {
  const now = today(s.timeZone);
  const [goals, cats, vari, fixed] = await Promise.all([
    db.query.savingsGoals.findMany({
      where: eq(savingsGoals.userId, s.userId),
      orderBy: [asc(savingsGoals.deadline), asc(savingsGoals.name)],
    }),
    getCategories(s.userId),
    db
      .select({ categoryId: variableExpenses.categoryId, n: sql<number>`sum(${variableExpenses.amount})::float` })
      .from(variableExpenses)
      .where(and(eq(variableExpenses.userId, s.userId), lte(variableExpenses.date, now)))
      .groupBy(variableExpenses.categoryId),
    db
      .select({ categoryId: fixedExpenses.categoryId, n: sql<number>`sum(${fixedExpenses.amount})::float` })
      .from(fixedExpenses)
      .where(and(eq(fixedExpenses.userId, s.userId), eq(fixedExpenses.status, "pagado")))
      .groupBy(fixedExpenses.categoryId),
  ]);
  const savedIn = (id: number) =>
    [...vari, ...fixed].filter((r) => r.categoryId === id).reduce((a, r) => a + r.n, 0);
  return goals.map((goal) => {
    const saved = round2(savedIn(goal.categoryId));
    const left = Math.max(0, goal.target - saved);
    const months = goal.deadline ? Math.max(1, monthsBetween(currentPeriod(s), periodOf(goal.deadline, s)) + 1) : 0;
    return {
      goal,
      category: cats.find((c) => c.id === goal.categoryId)!,
      saved,
      monthly: months ? round2(left / months) : null,
    };
  });
}

export async function ownsRefs(userId: string, refs: { categoryId?: number; cardId?: number | null }) {
  const [category, card] = await Promise.all([
    refs.categoryId
      ? db.query.categories.findFirst({
          where: and(eq(categories.id, refs.categoryId), eq(categories.userId, userId)),
          columns: { id: true },
        })
      : true,
    refs.cardId
      ? db.query.cards.findFirst({
          where: and(eq(cards.id, refs.cardId), eq(cards.userId, userId)),
          columns: { id: true },
        })
      : true,
  ]);
  if (!category || !card) throw new Error("Referencia ajena");
}
