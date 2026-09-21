import { test } from "node:test";
import assert from "node:assert/strict";
import { computeStatement, dayOn, daysBetween } from "./cards";

const card = { id: 1, name: "Visa", cutDay: 5, payDay: 25, paidStatement: null, createdAt: new Date() };
const charges = [
  { cardId: 1, amount: 100, date: "2026-08-05" }, // corte anterior, incluido en agosto
  { cardId: 1, amount: 200, date: "2026-08-20" }, // estado de cuenta de septiembre
  { cardId: 1, amount: 300, date: "2026-09-05" }, // día de corte: entra
  { cardId: 1, amount: 400, date: "2026-09-10" }, // periodo abierto
  { cardId: 2, amount: 999, date: "2026-09-01" }, // otra tarjeta
  { cardId: null, amount: 999, date: "2026-09-01" },
];

test("estado de cuenta: rangos, fechas y alerta", () => {
  const s = computeStatement(card, charges, "2026-09-21");
  assert.equal(s.statement, "2026-09");
  assert.equal(s.closedAt, "2026-09-05");
  assert.equal(s.dueAt, "2026-09-25");
  assert.equal(s.nextCut, "2026-10-05");
  assert.equal(s.toPay, 500);
  assert.equal(s.openTotal, 400);
  assert.equal(s.daysLeft, 4);
  assert.equal(s.alert, true);
  assert.equal(computeStatement(card, charges, "2026-09-19").alert, false);
  assert.equal(computeStatement({ ...card, paidStatement: "2026-09" }, charges, "2026-09-21").alert, false);
  assert.equal(computeStatement(card, charges, "2026-09-30").daysLeft, -5);
});

test("antes del corte usa el mes anterior; pago cruza de mes", () => {
  const s = computeStatement({ ...card, cutDay: 20, payDay: 10 }, charges, "2026-09-15");
  assert.equal(s.closedAt, "2026-08-20");
  assert.equal(s.dueAt, "2026-09-10");
  assert.equal(s.toPay, 300); // (07-20, 08-20]: 08-05 y 08-20
  assert.equal(s.openTotal, 700); // (08-20, 09-15]: 09-05 y 09-10
});

test("día de corte recortado al mes", () => {
  assert.equal(dayOn(2026, 2, 31), "2026-02-28");
  assert.equal(daysBetween("2026-12-30", "2027-01-02"), 3);
});
