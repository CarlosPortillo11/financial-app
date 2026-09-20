import {
  boolean,
  check,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  smallint,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const categoryType = pgEnum("category_type", [
  "necesidad",
  "deseo",
  "ahorro_inversion",
]);
export const categoryScope = pgEnum("category_scope", ["fijo", "variable", "ambos"]);
export const fixedStatus = pgEnum("fixed_status", ["pagado", "pendiente"]);
export const incomeType = pgEnum("income_type", ["salario", "ingreso_extra"]);

const money = () => numeric("amount", { precision: 12, scale: 2, mode: "number" }).notNull();

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    emoji: varchar("emoji", { length: 16 }).notNull(),
    name: varchar("name", { length: 60 }).notNull().unique(),
    type: categoryType("type").notNull(),
    appliesTo: categoryScope("applies_to").notNull().default("ambos"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
);

export const fixedExpenses = pgTable(
  "fixed_expenses",
  {
    id: serial("id").primaryKey(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
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
    index("fixed_expenses_period_idx").on(t.period),
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
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    description: varchar("description", { length: 120 }).notNull().default(""),
    amount: money(),
    // Quincena y mes se derivan de esta fecha.
    date: date("date", { mode: "string" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("variable_expenses_date_idx").on(t.date),
    check("variable_expenses_amount_check", sql`${t.amount} > 0`),
  ],
);

export const incomes = pgTable(
  "incomes",
  {
    id: serial("id").primaryKey(),
    source: varchar("source", { length: 120 }).notNull(),
    type: incomeType("type").notNull().default("salario"),
    amount: money(),
    date: date("date", { mode: "string" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("incomes_date_idx").on(t.date),
    check("incomes_amount_check", sql`${t.amount} > 0`),
  ],
);

// Fila única (id = 1). Porcentajes enteros.
export const settings = pgTable(
  "settings",
  {
    id: smallint("id").primaryKey().default(1),
    needsPct: smallint("needs_pct").notNull().default(50),
    wantsPct: smallint("wants_pct").notNull().default(30),
    savingsPct: smallint("savings_pct").notNull().default(20),
    savingSplitPct: smallint("saving_split_pct").notNull().default(10),
    investSplitPct: smallint("invest_split_pct").notNull().default(10),
  },
  (t) => [
    check("settings_single_row", sql`${t.id} = 1`),
    check("settings_rule_sum", sql`${t.needsPct} + ${t.wantsPct} + ${t.savingsPct} = 100`),
    check("settings_split_sum", sql`${t.savingSplitPct} + ${t.investSplitPct} = ${t.savingsPct}`),
  ],
);

export type Category = typeof categories.$inferSelect;
export type FixedExpense = typeof fixedExpenses.$inferSelect;
export type VariableExpense = typeof variableExpenses.$inferSelect;
export type Income = typeof incomes.$inferSelect;
export type Settings = typeof settings.$inferSelect;
export type CategoryType = Category["type"];
