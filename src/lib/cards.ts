import type { Card } from "@/db/schema";
import { round2 } from "./money";

/** Días antes de la fecha límite a partir de los cuales se avisa. */
export const ALERT_DAYS = 5;

export type Charge = { cardId: number | null; amount: number; date: string };

export type CardStatement = {
  card: Card;
  /** YYYY-MM del corte cerrado más reciente; es la clave que se guarda al pagar. */
  statement: string;
  closedAt: string;
  dueAt: string;
  /** Negativo = vencido. */
  daysLeft: number;
  toPay: number;
  paid: boolean;
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

export function computeStatement(card: Card, charges: Charge[], today: string): CardStatement {
  const [y, m, d] = split(today);
  // Corte cerrado más reciente: el de este mes si ya pasó, si no el del mes anterior.
  const [cy, cm] = d >= Math.min(card.cutDay, new Date(y, m, 0).getDate()) ? [y, m] : shiftMonth(y, m, -1);
  const closedAt = dayOn(cy, cm, card.cutDay);
  const [py, pm] = shiftMonth(cy, cm, -1);
  const prevCut = dayOn(py, pm, card.cutDay);
  const [ny, nm] = shiftMonth(cy, cm, 1);
  const nextCut = dayOn(ny, nm, card.cutDay);
  const dueAt = card.payDay > card.cutDay ? dayOn(cy, cm, card.payDay) : dayOn(ny, nm, card.payDay);

  const mine = charges.filter((c) => c.cardId === card.id);
  const sum = (from: string, to: string) =>
    round2(mine.filter((c) => c.date > from && c.date <= to).reduce((a, c) => a + c.amount, 0));

  const statement = closedAt.slice(0, 7);
  const paid = card.paidStatement === statement;
  const daysLeft = daysBetween(today, dueAt);
  const toPay = sum(prevCut, closedAt);
  return {
    card,
    statement,
    closedAt,
    dueAt,
    daysLeft,
    toPay,
    paid,
    openTotal: sum(closedAt, today),
    nextCut,
    alert: !paid && toPay > 0 && daysLeft <= ALERT_DAYS,
  };
}
