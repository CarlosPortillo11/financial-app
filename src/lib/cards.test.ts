import { test } from "node:test";
import assert from "node:assert/strict";
import { computeStatement, dayOn, daysBetween } from "./cards";

const card = { id: 1, userId: "u1", name: "Visa", cutDay: 5, payDay: 25, balanceFrom: "2026-08-06", createdAt: new Date() };
const charges = [
  { cardId: 1, amount: 100, date: "2026-08-05" },
  { cardId: 1, amount: 200, date: "2026-08-20" }, // estado de cuenta de septiembre
  { cardId: 1, amount: 300, date: "2026-09-05" }, // día de corte: entra
  { cardId: 1, amount: 400, date: "2026-09-10" }, // periodo abierto
  { cardId: 2, amount: 999, date: "2026-09-01" }, // otra tarjeta
  { cardId: null, amount: 999, date: "2026-09-01" },
];
const pay = (id: number, amount: number, date: string) => ({ id, cardId: 1, amount, date });

test("estado de cuenta: rangos, fechas y alerta", () => {
  const s = computeStatement(card, charges, [], "2026-09-21");
  assert.equal(s.closedAt, "2026-09-05");
  assert.equal(s.dueAt, "2026-09-25");
  assert.equal(s.nextCut, "2026-10-05");
  assert.equal(s.toPay, 500);
  assert.equal(s.pastDue, 0);
  assert.equal(s.openTotal, 400);
  assert.equal(s.daysLeft, 4);
  assert.equal(s.alert, true);
  assert.equal(computeStatement(card, charges, [], "2026-09-19").alert, false);
  assert.equal(computeStatement(card, charges, [], "2026-09-30").daysLeft, -5);
});

test("pago total cierra la alerta; deshacerlo la regresa", () => {
  const s = computeStatement(card, charges, [pay(1, 500, "2026-09-20")], "2026-09-21");
  assert.equal(s.toPay, 0);
  assert.equal(s.paid, true);
  assert.equal(s.alert, false);
  assert.equal(s.lastPayment?.id, 1);
});

test("pago parcial: el resto se arrastra y queda vencido tras el siguiente corte", () => {
  const partial = [pay(1, 200, "2026-09-20")];
  assert.equal(computeStatement(card, charges, partial, "2026-09-21").toPay, 300);
  const s = computeStatement(card, charges, partial, "2026-10-06");
  assert.equal(s.closedAt, "2026-10-05");
  assert.equal(s.pastDue, 300);
  assert.equal(s.toPay, 700);
  assert.equal(s.dueAt, "2026-09-25");
  assert.ok(s.daysLeft < 0);
  assert.equal(s.alert, true);
});

test("antes del corte usa el mes anterior; pago cruza de mes", () => {
  const s = computeStatement({ ...card, cutDay: 20, payDay: 10, balanceFrom: null }, charges, [], "2026-09-15");
  assert.equal(s.closedAt, "2026-08-20");
  assert.equal(s.dueAt, "2026-09-10");
  assert.equal(s.toPay, 300);
  assert.equal(s.openTotal, 700);
});

test("día de corte recortado al mes", () => {
  assert.equal(dayOn(2026, 2, 31), "2026-02-28");
  assert.equal(daysBetween("2026-12-30", "2027-01-02"), 3);
});
