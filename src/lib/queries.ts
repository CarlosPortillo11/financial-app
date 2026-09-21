import { and, asc, desc, eq, gte, isNotNull, lt, max } from "drizzle-orm";
import { db } from "@/db";
import { cards, categories, fixedExpenses, incomes, settings, variableExpenses } from "@/db/schema";
import { computeStatement, dayOn, type CardStatement } from "./cards";
import { computeMonth, type MonthData, type MonthSummary } from "./calc";
import { currentPeriod, periodRange, shiftPeriod, today } from "./period";

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
    source.map(({ categoryId, cardId, description, amount, biweek, dueDay }) => ({
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

export async function getCards() {
  return db.query.cards.findMany({
    orderBy: [asc(cards.name)],
  });
}

/** Estado de cuenta por tarjeta activa: cerrado (por pagar) y abierto (acumulando). */
export async function getCardStatements(): Promise<CardStatement[]> {
  const list = await getCards();
  if (!list.length) return [];
  const now = today();
  // Dos cortes hacia atrás cubren el estado cerrado y el abierto de cualquier tarjeta.
  const since = `${shiftPeriod(now.slice(0, 7), -2)}-01`;
  const [vari, fixed] = await Promise.all([
    db.query.variableExpenses.findMany({
      where: and(isNotNull(variableExpenses.cardId), gte(variableExpenses.date, since)),
      columns: { cardId: true, amount: true, date: true },
    }),
    db.query.fixedExpenses.findMany({
      where: and(isNotNull(fixedExpenses.cardId), gte(fixedExpenses.period, since.slice(0, 7))),
      columns: { cardId: true, amount: true, period: true, dueDay: true },
    }),
  ]);
  const charges = [
    ...vari,
    ...fixed.map((f) => {
      const [y, m] = f.period.split("-").map(Number);
      return { cardId: f.cardId, amount: f.amount, date: dayOn(y, m, f.dueDay) };
    }),
  ];
  return list.map((c) => computeStatement(c, charges, now));
}
