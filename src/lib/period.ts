export type Biweek = 1 | 2;

export type PayDays = { payDay1: number; payDay2: number };
export type Schedule = PayDays & { timeZone: string };

const pad = (n: number) => String(n).padStart(2, "0");

export function today(timeZone?: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date());
}

export function isRealDate(date: string): boolean {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export const PERIOD_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export function isPeriod(s: unknown): s is string {
  return typeof s === "string" && PERIOD_RE.test(s);
}

export function shiftPeriod(period: string, delta: number): string {
  const [y, m] = period.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

/** YYYY-MM-DD del día `day` del mes, recortado al último día si no existe (31 en febrero). */
function anchor(period: string, day: number): string {
  const [y, m] = period.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  return `${period}-${pad(Math.min(day, last))}`;
}

/** Rango [inicio, fin) del mes de nómina: abre el día payDay1 y cierra el día antes del siguiente. */
export function periodRange(period: string, p: PayDays): { start: string; end: string } {
  return { start: anchor(period, p.payDay1), end: anchor(shiftPeriod(period, 1), p.payDay1) };
}

/** Mes de nómina al que pertenece una fecha. Antes del payDay1 la fecha cae en el mes anterior. */
export function periodOf(date: string, p: PayDays): string {
  const month = date.slice(0, 7);
  return date >= anchor(month, p.payDay1) ? month : shiftPeriod(month, -1);
}

export function currentPeriod(p: Schedule): string {
  return periodOf(today(p.timeZone), p);
}

/** Quincena por nómina: Q1 va del primer día de pago al día anterior al segundo; Q2 el resto (cruza al mes siguiente). */
export function biweekForDueDay(day: number, p: PayDays): Biweek {
  return day >= p.payDay1 && day < p.payDay2 ? 1 : 2;
}

export function biweekOf(date: string, p: PayDays): Biweek {
  const [y, m, d] = date.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  return biweekForDueDay(d, { payDay1: Math.min(p.payDay1, last), payDay2: Math.min(p.payDay2, last) });
}

export function biweekLabel(n: Biweek, p: PayDays): string {
  if (n === 1) return `del ${p.payDay1} al ${p.payDay2 - 1}`;
  return `del ${p.payDay2} al ${p.payDay1 === 1 ? "fin de mes" : p.payDay1 - 1}`;
}

export function formatPeriod(period: string): string {
  const [y, m] = period.split("-").map(Number);
  return new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" })
    .format(new Date(y, m - 1, 1))
    .replace(/^./, (c) => c.toUpperCase());
}

/** "14 sep – 13 oct": los días reales que cubre el mes de nómina. */
export function formatPeriodRange(period: string, p: PayDays): string {
  const { start, end } = periodRange(period, p);
  const [y, m, d] = end.split("-").map(Number);
  const last = new Date(y, m - 1, d - 1);
  return `${formatDate(start)} – ${formatDate(`${last.getFullYear()}-${pad(last.getMonth() + 1)}-${pad(last.getDate())}`)}`;
}

export function formatDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short" }).format(
    new Date(y, m - 1, d),
  );
}

/** Fecha real de un gasto fijo: el mes de nómina `period` cruza al calendario siguiente antes del payDay1. */
export function dueDate(period: string, dueDay: number, p: PayDays): string {
  return anchor(dueDay >= p.payDay1 ? period : shiftPeriod(period, 1), dueDay);
}

export function shiftDate(date: string, months: number): string {
  return anchor(shiftPeriod(date.slice(0, 7), months), Number(date.slice(8, 10)));
}

export function monthsBetween(from: string, to: string): number {
  const [fy, fm] = from.split("-").map(Number);
  const [ty, tm] = to.split("-").map(Number);
  return (ty - fy) * 12 + (tm - fm);
}

export function nextPayDate(date: string, p: PayDays): string {
  const month = date.slice(0, 7);
  const next = shiftPeriod(month, 1);
  return [anchor(month, p.payDay1), anchor(month, p.payDay2), anchor(next, p.payDay1)].find((d) => d > date)!;
}
