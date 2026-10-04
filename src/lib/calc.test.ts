import { test } from "node:test";
import assert from "node:assert/strict";
import { computeMonth, dailyAllowance, type MonthData } from "./calc";
import {
  biweekLabel,
  biweekOf,
  isRealDate,
  monthsBetween,
  nextPayDate,
  shiftDate,
  dueDate,
  formatPeriodRange,
  periodOf,
  periodRange,
  shiftPeriod,
} from "./period";

const now = new Date();
const cat = (id: number, type: MonthData["categories"][0]["type"]): MonthData["categories"][0] => ({
  id,
  userId: "u1",
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
    { id: 1, userId: "u1", source: "s", type: "salario", amount: 6000, date: "2026-09-01", recurring: false, createdAt: now },
    { id: 2, userId: "u1", source: "s", type: "salario", amount: 4000, date: "2026-09-16", recurring: false, createdAt: now },
  ],
  fixed: [
    { id: 1, userId: "u1", categoryId: 1, cardId: null, description: "renta", amount: 3000, period: "2026-09", biweek: 1, dueDay: 20, status: "pendiente", active: true, createdAt: now },
    // vence el 5 (lo paga la nómina del 28) pero está en quincena 1: mal asignado
    { id: 2, userId: "u1", categoryId: 2, cardId: null, description: "netflix", amount: 200, period: "2026-09", biweek: 1, dueDay: 5, status: "pendiente", active: true, createdAt: now },
  ],
  variable: [
    { id: 1, userId: "u1", categoryId: 1, cardId: null, description: "", amount: 1500, date: "2026-09-10", createdAt: now },
    { id: 2, userId: "u1", categoryId: 2, cardId: null, description: "", amount: 1800, date: "2026-09-20", createdAt: now },
    { id: 3, userId: "u1", categoryId: 3, cardId: null, description: "", amount: 1000, date: "2026-09-28", createdAt: now },
  ],
  settings: { userId: "u1", timeZone: "America/Mexico_City", currency: "MXN", needsPct: 50, wantsPct: 30, savingsPct: 20, savingSplitPct: 10, investSplitPct: 10, payDay1: 14, payDay2: 28, carryBalance: true },
  carryOver: 0,
};

test("totales y disponible", () => {
  const s = computeMonth(data);
  assert.deepEqual(s.totals, { carryOver: 0, income: 10000, fixed: 3200, variable: 4300, spent: 7500, available: 2500 });
});

test("quincenas", () => {
  const [q1, q2] = computeMonth(data).byBiweek;
  assert.deepEqual(q1, { biweek: 1, range: "del 14 al 27", carryOver: 0, income: 4000, fixed: 3200, variable: 1800, spent: 5000, available: -1000 });
  assert.deepEqual(q2, { biweek: 2, range: "del 28 al 13", carryOver: 0, income: 6000, fixed: 0, variable: 2500, spent: 2500, available: 3500 });
});

test("categorias: porcentajes y alerta alta", () => {
  const s = computeMonth(data);
  const c1 = s.byCategory.find((c) => c.category.id === 1)!;
  assert.equal(c1.total, 4500);
  assert.equal(c1.pctOfSpent, 0.6);
  assert.equal(c1.pctOfIncome, 0.45);
  assert.equal(c1.high, false);
  assert.deepEqual(s.alerts.highCategories.map((c) => c.category.id), [2]);
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
  assert.equal(s.suggestions.saving, 500);
  assert.equal(s.suggestions.invest, 500);
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
  assert.deepEqual(periodRange("2026-02", p), { start: "2026-02-14", end: "2026-03-14" });
  assert.deepEqual(periodRange("2026-01", { payDay1: 30, payDay2: 31 }), {
    start: "2026-01-30",
    end: "2026-02-28",
  });
  assert.equal(periodOf("2026-10-03", p), "2026-09");
  assert.equal(periodOf("2026-10-14", p), "2026-10");
  assert.equal(periodOf("2026-09-30", p), "2026-09");
  assert.equal(periodOf("2026-02-28", { payDay1: 30, payDay2: 31 }), "2026-02");
  assert.equal(dueDate("2026-09", 1, p), "2026-10-01");
  assert.equal(dueDate("2026-09", 28, p), "2026-09-28");
  assert.equal(formatPeriodRange("2026-09", p), "14 sep – 13 oct");
});

test("gasto sin culpa no supera lo disponible", () => {
  const s = computeMonth({ ...data, incomes: [data.incomes[0], { ...data.incomes[1], amount: 1000 }] });
  assert.equal(s.totals.available, -500);
  assert.equal(s.suggestions.guiltFree, 0);
});

test("pago el 15 y el 30: en febrero el 28 ya es quincena 2", () => {
  const p = { payDay1: 15, payDay2: 30 };
  assert.equal(biweekOf("2026-02-27", p), 1);
  assert.equal(biweekOf("2026-02-28", p), 2);
  assert.equal(biweekOf("2026-03-29", p), 1);
  assert.equal(biweekLabel(2, { payDay1: 1, payDay2: 16 }), "del 16 al fin de mes");
});

test("fechas inexistentes", () => {
  assert.equal(isRealDate("2026-02-31"), false);
  assert.equal(isRealDate("2028-02-29"), true);
});

test("saldo arrastrado suma a lo disponible y a la quincena 1", () => {
  const s = computeMonth({ ...data, carryOver: 1200 });
  assert.equal(s.totals.available, 3700);
  assert.equal(s.byBiweek[0].available, 200);
  assert.equal(s.byBiweek[1].available, 3500);
});

test("gasto diario hasta el siguiente pago", () => {
  const p = data.settings;
  const s = computeMonth({ ...data, carryOver: 2600 });
  assert.deepEqual(dailyAllowance(s, p, "2026-09-20"), { amount: 200, days: 8, until: "2026-09-28" });
  assert.deepEqual(dailyAllowance(s, p, "2026-10-04"), { amount: 510, days: 10, until: "2026-10-14" });
  assert.equal(dailyAllowance(computeMonth(data), p, "2026-09-20").amount, 0);
});

test("fechas de pago y desplazamiento de meses", () => {
  const p = { payDay1: 15, payDay2: 30 };
  assert.equal(nextPayDate("2026-02-15", p), "2026-02-28");
  assert.equal(nextPayDate("2026-02-28", p), "2026-03-15");
  assert.equal(nextPayDate("2026-02-10", p), "2026-02-15");
  assert.equal(shiftDate("2026-01-31", 1), "2026-02-28");
  assert.equal(shiftDate("2026-11-15", 2), "2027-01-15");
  assert.equal(monthsBetween("2026-11", "2027-02"), 3);
});
