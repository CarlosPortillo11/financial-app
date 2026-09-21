import { test } from "node:test";
import assert from "node:assert/strict";
import { computeMonth, type MonthData } from "./calc";
import { biweekOf, periodRange, shiftPeriod } from "./period";

const now = new Date();
const cat = (id: number, type: MonthData["categories"][0]["type"]): MonthData["categories"][0] => ({
  id,
  emoji: "x",
  name: `c${id}`,
  type,
  appliesTo: "ambos",
  active: true,
  createdAt: now,
});

const data: MonthData = {
  categories: [cat(1, "necesidad"), cat(2, "deseo"), cat(3, "ahorro_inversion")],
  incomes: [
    { id: 1, source: "s", type: "salario", amount: 6000, date: "2026-09-01", createdAt: now },
    { id: 2, source: "s", type: "salario", amount: 4000, date: "2026-09-16", createdAt: now },
  ],
  fixed: [
    { id: 1, categoryId: 1, description: "renta", amount: 3000, period: "2026-09", biweek: 1, dueDay: 20, status: "pendiente", active: true, createdAt: now },
    // vence el 5 (lo paga la nómina del 28) pero está en quincena 1: mal asignado
    { id: 2, categoryId: 2, description: "netflix", amount: 200, period: "2026-09", biweek: 1, dueDay: 5, status: "pendiente", active: true, createdAt: now },
  ],
  variable: [
    { id: 1, categoryId: 1, description: "", amount: 1500, date: "2026-09-10", createdAt: now },
    { id: 2, categoryId: 2, description: "", amount: 1800, date: "2026-09-20", createdAt: now },
    { id: 3, categoryId: 3, description: "", amount: 1000, date: "2026-09-28", createdAt: now },
  ],
  settings: { id: 1, needsPct: 50, wantsPct: 30, savingsPct: 20, savingSplitPct: 10, investSplitPct: 10, payDay1: 14, payDay2: 28 },
};

test("totales y disponible", () => {
  const s = computeMonth(data);
  assert.deepEqual(s.totals, { income: 10000, fixed: 3200, variable: 4300, spent: 7500, available: 2500 });
});

test("quincenas", () => {
  const [q1, q2] = computeMonth(data).byBiweek;
  assert.deepEqual(q1, { biweek: 1, range: "del 14 al 27", income: 4000, fixed: 3200, variable: 1800, spent: 5000, available: -1000 });
  assert.deepEqual(q2, { biweek: 2, range: "del 28 al 13", income: 6000, fixed: 0, variable: 2500, spent: 2500, available: 3500 });
});

test("categorias: porcentajes y alerta alta", () => {
  const s = computeMonth(data);
  const c1 = s.byCategory.find((c) => c.category.id === 1)!;
  assert.equal(c1.total, 4500);
  assert.equal(c1.pctOfSpent, 0.6);
  assert.equal(c1.pctOfIncome, 0.45);
  assert.equal(c1.high, true);
  assert.deepEqual(s.alerts.highCategories.map((c) => c.category.id), [1, 2]);
});

test("regla 50/30/20 con ahorro invertido", () => {
  const s = computeMonth(data);
  const [needs, wants, sav] = s.byType;
  assert.equal(needs.target, 5000);
  assert.equal(needs.diff, -500);
  assert.equal(needs.bad, false);
  assert.equal(wants.target, 3000);
  assert.equal(wants.diff, -1000);
  assert.equal(wants.bad, false);
  assert.equal(sav.target, 2000);
  assert.equal(sav.diff, -1000);
  assert.equal(sav.bad, true);
  assert.equal(s.suggestions.guiltFree, 1000);
  assert.equal(s.suggestions.saving, 1000);
});

test("fijo con quincena mal asignada", () => {
  assert.deepEqual(computeMonth(data).alerts.misassignedFixed.map((f) => f.id), [2]);
});

test("sin ingreso no divide por cero", () => {
  const s = computeMonth({ ...data, incomes: [] });
  assert.equal(s.byCategory[0].pctOfIncome, 0);
  assert.equal(s.totals.available, -7500);
});

test("helpers de periodo", () => {
  const p = { payDay1: 14, payDay2: 28 };
  assert.equal(biweekOf("2026-09-13", p), 2);
  assert.equal(biweekOf("2026-09-14", p), 1);
  assert.equal(biweekOf("2026-09-27", p), 1);
  assert.equal(biweekOf("2026-09-28", p), 2);
  assert.equal(shiftPeriod("2026-12", 1), "2027-01");
  assert.equal(shiftPeriod("2026-01", -1), "2025-12");
  assert.deepEqual(periodRange("2026-02"), { start: "2026-02-01", end: "2026-03-01" });
});
