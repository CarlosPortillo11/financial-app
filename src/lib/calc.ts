import type {
  Category,
  CategoryType,
  FixedExpense,
  Income,
  Settings,
  VariableExpense,
} from "@/db/schema";
import { biweekForDueDay, biweekOf, type Biweek } from "./period";
import { round2 } from "./money";

// Umbral de alerta: categoría que consume > 15% del ingreso.
export const HIGH_CATEGORY_RATIO = 0.15;

export const TYPE_LABEL: Record<CategoryType, string> = {
  necesidad: "Necesidades",
  deseo: "Deseos",
  ahorro_inversion: "Ahorro e inversión",
};

export type MonthData = {
  categories: Category[];
  fixed: FixedExpense[];
  variable: VariableExpense[];
  incomes: Income[];
  settings: Settings;
};

export type Totals = {
  income: number;
  fixed: number;
  variable: number;
  spent: number;
  available: number;
};

export type BiweekSummary = Totals & { biweek: Biweek };

export type CategorySummary = {
  category: Category;
  fixed: number;
  variable: number;
  total: number;
  pctOfSpent: number;
  pctOfIncome: number;
  high: boolean;
};

export type RuleStatus = "over" | "on" | "under";

export type TypeSummary = {
  type: CategoryType;
  label: string;
  targetPct: number;
  target: number;
  actual: number;
  actualPct: number;
  diff: number;
  status: RuleStatus;
  /** true cuando el estado es negativo para el usuario (exceso o ahorro insuficiente). */
  bad: boolean;
  message: string;
};

export type MonthSummary = {
  totals: Totals;
  byBiweek: [BiweekSummary, BiweekSummary];
  byCategory: CategorySummary[];
  byType: TypeSummary[];
  alerts: {
    highCategories: CategorySummary[];
    misassignedFixed: FixedExpense[];
  };
  suggestions: {
    saving: number;
    invest: number;
    guiltFree: number;
  };
};

const sum = (ns: number[]) => round2(ns.reduce((a, b) => a + b, 0));
const ratio = (part: number, whole: number) => (whole > 0 ? part / whole : 0);

export function computeMonth(data: MonthData): MonthSummary {
  const { categories, fixed, variable, incomes, settings } = data;

  const income = sum(incomes.map((i) => i.amount));
  const fixedTotal = sum(fixed.map((f) => f.amount));
  const variableTotal = sum(variable.map((v) => v.amount));
  const spent = round2(fixedTotal + variableTotal);
  const totals: Totals = {
    income,
    fixed: fixedTotal,
    variable: variableTotal,
    spent,
    available: round2(income - spent),
  };

  const biweek = (n: Biweek): BiweekSummary => {
    const inc = sum(incomes.filter((i) => biweekOf(i.date) === n).map((i) => i.amount));
    const fix = sum(fixed.filter((f) => f.biweek === n).map((f) => f.amount));
    const vari = sum(variable.filter((v) => biweekOf(v.date) === n).map((v) => v.amount));
    return {
      biweek: n,
      income: inc,
      fixed: fix,
      variable: vari,
      spent: round2(fix + vari),
      available: round2(inc - fix - vari),
    };
  };

  const byCategory: CategorySummary[] = categories
    .map((category) => {
      const fix = sum(fixed.filter((f) => f.categoryId === category.id).map((f) => f.amount));
      const vari = sum(
        variable.filter((v) => v.categoryId === category.id).map((v) => v.amount),
      );
      const total = round2(fix + vari);
      const pctOfIncome = ratio(total, income);
      return {
        category,
        fixed: fix,
        variable: vari,
        total,
        pctOfSpent: ratio(total, spent),
        pctOfIncome,
        high: pctOfIncome > HIGH_CATEGORY_RATIO,
      };
    })
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  const targetPct: Record<CategoryType, number> = {
    necesidad: settings.needsPct,
    deseo: settings.wantsPct,
    ahorro_inversion: settings.savingsPct,
  };

  const byType: TypeSummary[] = (Object.keys(TYPE_LABEL) as CategoryType[]).map((type) => {
    const actual = sum(byCategory.filter((c) => c.category.type === type).map((c) => c.total));
    const target = round2((targetPct[type] / 100) * income);
    const diff = round2(actual - target);
    const status: RuleStatus = diff > 0 ? "over" : diff < 0 ? "under" : "on";
    const isSaving = type === "ahorro_inversion";
    // Ahorro va invertido: quedarse corto es lo malo.
    const bad = isSaving ? status === "under" : status === "over";
    return {
      type,
      label: TYPE_LABEL[type],
      targetPct: targetPct[type],
      target,
      actual,
      actualPct: ratio(actual, income),
      diff,
      status,
      bad,
      message: ruleMessage(type, status),
    };
  });

  const misassignedFixed = fixed.filter((f) => biweekForDueDay(f.dueDay) !== f.biweek);
  const wants = byType.find((t) => t.type === "deseo")!;

  return {
    totals,
    byBiweek: [biweek(1), biweek(2)],
    byCategory,
    byType,
    alerts: {
      highCategories: byCategory.filter((c) => c.high),
      misassignedFixed,
    },
    suggestions: {
      saving: round2((settings.savingSplitPct / 100) * income),
      invest: round2((settings.investSplitPct / 100) * income),
      guiltFree: Math.max(0, round2(wants.target - wants.actual)),
    },
  };
}

function ruleMessage(type: CategoryType, status: RuleStatus): string {
  if (type === "ahorro_inversion") {
    if (status === "under") return "Ahorras menos de la meta";
    if (status === "over") return "Superas la meta de ahorro";
    return "Justo en la meta";
  }
  if (status === "over") return "Excedes la meta, considera recortar";
  if (status === "under") return "Con margen";
  return "Justo en la meta";
}
