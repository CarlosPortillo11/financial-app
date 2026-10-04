import type { Card } from "@/db/schema";
import { round2 } from "./money";

/** Días antes de la fecha límite a partir de los cuales se avisa. */
export const ALERT_DAYS = 5;

export type Charge = { cardId: number | null; amount: number; date: string };
export type Payment = { id: number; cardId: number; amount: number; date: string };

export type CardStatement = {
  card: Card;
  closedAt: string;
  dueAt: string;
  /** Negativo = vencido. */
  daysLeft: number;
  toPay: number;
  pastDue: number;
  paid: boolean;
  lastPayment: Payment | null;
  /** Cargos desde el corte cerrado hasta hoy (periodo abierto). */
  openTotal: number;
  nextCut: string;
  alert: boolean;
};

const pad = (n: number) => String(n).padStart(2, "0");
const split = (d: string) => d.split("-").map(Number) as [number, number, number];

/** YYYY-MM-DD del día `day` en el mes dado, recortado al último día del mes (31 en febrero → 28/29). */
export function dayOn(y: number, m: number, day: number): string {
  const d = new Date(y, m, 0).getDate();
  return `${y}-${pad(m)}-${pad(Math.min(day, d))}`;
}

function shiftMonth(y: number, m: number, delta: number): [number, number] {
  const d = new Date(y, m - 1 + delta, 1);
  return [d.getFullYear(), d.getMonth() + 1];
}

export function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = split(from);
  const [ty, tm, td] = split(to);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86_400_000);
}

function dueFor(card: Card, cy: number, cm: number): string {
  const [ny, nm] = shiftMonth(cy, cm, 1);
  return card.payDay > card.cutDay ? dayOn(cy, cm, card.payDay) : dayOn(ny, nm, card.payDay);
}

export function computeStatement(
  card: Card,
  charges: Charge[],
  payments: Payment[],
  today: string,
): CardStatement {
  const [y, m, d] = split(today);
  // Corte cerrado más reciente: el de este mes si ya pasó, si no el del mes anterior.
  const [cy, cm] = d >= Math.min(card.cutDay, new Date(y, m, 0).getDate()) ? [y, m] : shiftMonth(y, m, -1);
  const closedAt = dayOn(cy, cm, card.cutDay);
  const [py, pm] = shiftMonth(cy, cm, -1);
  const prevCut = dayOn(py, pm, card.cutDay);
  const [ny, nm] = shiftMonth(cy, cm, 1);
  const nextCut = dayOn(ny, nm, card.cutDay);

  const from = card.balanceFrom ?? "";
  const counts = (date: string) => date >= from && date <= today;
  const mine = charges.filter((c) => c.cardId === card.id && counts(c.date));
  const charged = (to: string) => mine.filter((c) => c.date <= to).reduce((a, c) => a + c.amount, 0);
  const myPayments = payments.filter((p) => p.cardId === card.id && counts(p.date));
  const paidTotal = myPayments.reduce((a, p) => a + p.amount, 0);

  const toPay = Math.max(0, round2(charged(closedAt) - paidTotal));
  const pastDue = Math.max(0, round2(charged(prevCut) - paidTotal));
  const dueAt = pastDue > 0 ? dueFor(card, py, pm) : dueFor(card, cy, cm);
  const daysLeft = daysBetween(today, dueAt);
  const lastPayment = myPayments.filter((p) => p.date > closedAt).sort((a, b) => b.id - a.id)[0] ?? null;

  return {
    card,
    closedAt,
    dueAt,
    daysLeft,
    toPay,
    pastDue,
    paid: toPay === 0,
    lastPayment,
    openTotal: round2(charged(today) - charged(closedAt)),
    nextCut,
    alert: toPay > 0 && daysLeft <= ALERT_DAYS,
  };
}
