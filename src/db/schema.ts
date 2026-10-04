import {
  boolean,
  check,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  smallint,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./auth-schema";

export * from "./auth-schema";

export const categoryType = pgEnum("category_type", [
  "necesidad",
  "deseo",
  "ahorro_inversion",
]);
export const categoryScope = pgEnum("category_scope", ["fijo", "variable", "ambos"]);
export const fixedStatus = pgEnum("fixed_status", ["pagado", "pendiente"]);
export const incomeType = pgEnum("income_type", ["salario", "ingreso_extra"]);

const money = () => numeric("amount", { precision: 12, scale: 2, mode: "number" }).notNull();
const owner = () =>
  text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" });

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    userId: owner(),
    emoji: varchar("emoji", { length: 16 }).notNull(),
    name: varchar("name", { length: 60 }).notNull(),
    type: categoryType("type").notNull(),
    appliesTo: categoryScope("applies_to").notNull().default("ambos"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("categories_user_name_unique").on(t.userId, t.name)],
);

export const cards = pgTable(
  "cards",
  {
    id: serial("id").primaryKey(),
    userId: owner(),
    name: varchar("name", { length: 60 }).notNull(),
    cutDay: smallint("cut_day").notNull(),
    payDay: smallint("pay_day").notNull(),
    balanceFrom: date("balance_from", { mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique("cards_user_name_unique").on(t.userId, t.name),
    check("cards_cut_day_check", sql`${t.cutDay} between 1 and 31`),
    check("cards_pay_day_check", sql`${t.payDay} between 1 and 31`),
  ],
);

const cardRef = () => integer("card_id").references(() => cards.id, { onDelete: "set null" });

export const cardPayments = pgTable(
  "card_payments",
  {
    id: serial("id").primaryKey(),
    userId: owner(),
    cardId: integer("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    amount: money(),
    date: date("date", { mode: "string" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("card_payments_card_idx").on(t.cardId),
    check("card_payments_amount_check", sql`${t.amount} > 0`),
  ],
);

export const seededPeriods = pgTable(
  "seeded_periods",
  {
    userId: owner(),
    period: varchar("period", { length: 7 }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.period] })],
);

export const fixedExpenses = pgTable(
  "fixed_expenses",
  {
    id: serial("id").primaryKey(),
    userId: owner(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    cardId: cardRef(),
    description: varchar("description", { length: 120 }).notNull(),
    amount: money(),
    // YYYY-MM. Mes explícito porque un fijo no tiene fecha de movimiento.
    period: varchar("period", { length: 7 }).notNull(),
    biweek: smallint("biweek").notNull(),
    dueDay: smallint("due_day").notNull(),
    status: fixedStatus("status").notNull().default("pendiente"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("fixed_expenses_user_period_idx").on(t.userId, t.period),
    check("fixed_expenses_biweek_check", sql`${t.biweek} in (1, 2)`),
    check("fixed_expenses_due_day_check", sql`${t.dueDay} between 1 and 31`),
    check("fixed_expenses_amount_check", sql`${t.amount} > 0`),
    check("fixed_expenses_period_check", sql`${t.period} ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'`),
  ],
);

export const variableExpenses = pgTable(
  "variable_expenses",
  {
    id: serial("id").primaryKey(),
    userId: owner(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    cardId: cardRef(),
    description: varchar("description", { length: 120 }).notNull().default(""),
    amount: money(),
    // Quincena y mes se derivan de esta fecha.
    date: date("date", { mode: "string" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("variable_expenses_user_date_idx").on(t.userId, t.date),
    check("variable_expenses_amount_check", sql`${t.amount} > 0`),
  ],
);

export const incomes = pgTable(
  "incomes",
  {
    id: serial("id").primaryKey(),
    userId: owner(),
    source: varchar("source", { length: 120 }).notNull(),
    type: incomeType("type").notNull().default("salario"),
    recurring: boolean("recurring").notNull().default(false),
    amount: money(),
    date: date("date", { mode: "string" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("incomes_user_date_idx").on(t.userId, t.date),
    check("incomes_amount_check", sql`${t.amount} > 0`),
  ],
);

// Una fila por usuario. Porcentajes enteros.
export const settings = pgTable(
  "settings",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => user.id, { onDelete: "cascade" }),
    needsPct: smallint("needs_pct").notNull().default(50),
    wantsPct: smallint("wants_pct").notNull().default(30),
    savingsPct: smallint("savings_pct").notNull().default(20),
    savingSplitPct: smallint("saving_split_pct").notNull().default(10),
    investSplitPct: smallint("invest_split_pct").notNull().default(10),
    // Días de nómina. Q1 = [payDay1, payDay2), Q2 = resto del mes.
    payDay1: smallint("pay_day_1").notNull().default(14),
    payDay2: smallint("pay_day_2").notNull().default(28),
    carryBalance: boolean("carry_balance").notNull().default(true),
    timeZone: varchar("time_zone", { length: 64 }).notNull().default("America/Mexico_City"),
    currency: varchar("currency", { length: 3 }).notNull().default("MXN"),
  },
  (t) => [
    check("settings_pay_days", sql`${t.payDay1} between 1 and 31 and ${t.payDay2} between 1 and 31 and ${t.payDay1} < ${t.payDay2}`),
    check("settings_rule_sum", sql`${t.needsPct} + ${t.wantsPct} + ${t.savingsPct} = 100`),
    check("settings_split_sum", sql`${t.savingSplitPct} + ${t.investSplitPct} = ${t.savingsPct}`),
  ],
);

export const savingsGoals = pgTable(
  "savings_goals",
  {
    id: serial("id").primaryKey(),
    userId: owner(),
    name: varchar("name", { length: 60 }).notNull(),
    categoryId: integer("category_id")
      .notNull()
      .unique()
      .references(() => categories.id, { onDelete: "restrict" }),
    target: numeric("target", { precision: 12, scale: 2, mode: "number" }).notNull(),
    deadline: date("deadline", { mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [check("savings_goals_target_check", sql`${t.target} > 0`)],
);

export type Category = typeof categories.$inferSelect;
export type FixedExpense = typeof fixedExpenses.$inferSelect;
export type VariableExpense = typeof variableExpenses.$inferSelect;
export type Income = typeof incomes.$inferSelect;
export type Settings = typeof settings.$inferSelect;
export type Card = typeof cards.$inferSelect;
export type CardPayment = typeof cardPayments.$inferSelect;
export type CategoryType = Category["type"];
export type SavingsGoal = typeof savingsGoals.$inferSelect;
